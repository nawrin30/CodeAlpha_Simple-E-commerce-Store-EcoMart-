

from django.urls import path
from . import views

urlpatterns = [
    
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),

   
    path('categories/', views.get_categories, name='get_categories'),
    path('products/', views.get_products, name='get_products'),
    path('products/<int:pk>/', views.get_product_detail, name='get_product_detail'),

   
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/history/', views.get_user_orders, name='get_user_orders'),

  
    path('admin/products/', views.admin_manage_product, name='admin_add_product'),
    path('admin/products/<int:pk>/', views.admin_manage_product, name='admin_update_delete_product'),
    path('admin/orders/', views.admin_get_all_orders, name='admin_get_all_orders'),
    path('admin/users/', views.admin_get_all_users, name='admin_get_all_users'),
]