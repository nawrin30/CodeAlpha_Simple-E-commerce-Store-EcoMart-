# backend/store/views.py

import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q

from .models import Category, Product, Order, OrderItem
from .serializers import (
    UserSerializer,
    CategorySerializer,
    ProductSerializer,
    OrderSerializer
)

# -------------------------------------------------------------------
# User Authentication API Views
# -------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user account with validated credentials.
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Authenticate user and initiate session login.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'message': 'Login successful!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff
            }
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_user(request):
    """
    Logout the currently authenticated user session.
    """
    logout(request)
    return Response({'message': 'Logged out successfully!'}, status=status.HTTP_200_OK)


# -------------------------------------------------------------------
# Category & Product API Views
# -------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """
    Fetch list of all available categories.
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    """
    Fetch product catalog with optional category filtering and search.
    """
    category_slug = request.GET.get('category', None)
    search_query = request.GET.get('search', None)
    is_featured = request.GET.get('featured', None)

    products = Product.objects.all()

    if category_slug and category_slug != 'all':
        products = products.filter(category__slug=category_slug)

    if search_query:
        products = products.filter(
            Q(title__icontains=search_query) | Q(description__icontains=search_query)
        )

    if is_featured:
        products = products.filter(is_featured=True)

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_detail(request, pk):
    """
    Fetch complete details for a single product by primary key.
    """
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


# -------------------------------------------------------------------
# Order & Checkout API Views
# -------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    Process new order submission and persist Order + OrderItems.
    """
    data = request.data
    cart_items = data.get('cart', [])

    if not cart_items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate unique Order ID
    generated_order_id = f"ECO-{uuid.uuid4().hex[:6].upper()}"

    # Determine user reference if authenticated
    user_ref = request.user if request.user.is_authenticated else None

    # Save parent Order
    order = Order.objects.create(
        user=user_ref,
        order_id=generated_order_id,
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        city=data.get('city'),
        zip_code=data.get('zipCode'),
        total_amount=data.get('totalAmount'),
        payment_method=data.get('paymentMethod', 'Cash on Delivery')
    )

    # Save associated OrderItems
    for item in cart_items:
        product_obj = Product.objects.filter(id=item.get('id')).first()
        OrderItem.objects.create(
            order=order,
            product=product_obj,
            product_name=item.get('title', 'Eco Product'),
            price=item.get('price'),
            quantity=item.get('quantity', 1)
        )

    serializer = OrderSerializer(order)
    return Response({
        'message': 'Order placed successfully!',
        'order': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """
    Fetch order history for the logged-in customer.
    """
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------------------------------------------
# Admin Panel API Views
# -------------------------------------------------------------------

@api_view(['POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_manage_product(request, pk=None):
    """
    CRUD endpoints for administrators to manage inventory.
    """
    if request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_all_orders(request):
    """
    Retrieve all customer orders for store administrator review.
    """
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_get_all_users(request):
    """
    Retrieve registered user accounts for management.
    """
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)