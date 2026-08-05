

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User details and registration data.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_staff')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for product categories.
    """
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for store product catalog.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for line items within an order.
    """
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'price', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for placing and viewing customer orders.
    """
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'