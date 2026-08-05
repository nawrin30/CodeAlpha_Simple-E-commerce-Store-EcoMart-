
const MOCK_PRODUCTS = [
    {
        id: 'PROD-101',
        title: 'Bamboo Toothbrush Set (4-Pack)',
        category: 'personal-care',
        price: 12.99,
        rating: 4.8,
        reviewsCount: 124,
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
        description: '100% biodegradable organic bamboo toothbrushes with BPA-free soft bristles. Perfectly eco-friendly for everyday oral hygiene.',
        isFeatured: true
    },
    {
        id: 'PROD-102',
        title: 'Reusable Beeswax Food Wraps',
        category: 'kitchen',
        price: 18.50,
        rating: 4.9,
        reviewsCount: 89,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        description: 'Sustainable alternative to plastic cling wrap. Made from organic cotton, ethically sourced beeswax, and jojoba oil.',
        isFeatured: true
    },
    {
        id: 'PROD-103',
        title: 'Stainless Steel Insulated Water Bottle',
        category: 'home',
        price: 24.99,
        rating: 4.7,
        reviewsCount: 210,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        description: 'Double-wall vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Zero single-use plastic.',
        isFeatured: true
    },
    {
        id: 'PROD-104',
        title: 'Organic Cotton Produce Bags Set',
        category: 'kitchen',
        price: 14.20,
        rating: 4.6,
        reviewsCount: 67,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        description: 'Durable mesh bags for grocery shopping. Washable, reusable, and breathable organic cotton mesh with drawstring closures.',
        isFeatured: true
    },
    {
        id: 'PROD-105',
        title: 'Natural Shampoo & Conditioner Bars',
        category: 'personal-care',
        price: 15.00,
        rating: 4.8,
        reviewsCount: 156,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        description: 'Zero-waste hair care set enriched with essential oils and plant extracts. Vegan, sulfate-free, and packaged without plastic.',
        isFeatured: false
    },
    {
        id: 'PROD-106',
        title: 'Recycled Glass Water Pitcher',
        category: 'home',
        price: 29.99,
        rating: 4.5,
        reviewsCount: 42,
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        description: 'Handcrafted water pitcher made entirely from 100% recycled glass. Elegant, sustainable addition to your dining table.',
        isFeatured: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();

    
    if (document.getElementById('featuredProductsContainer')) {
        renderFeaturedProducts();
    }

    
    if (document.getElementById('productsContainer')) {
        initShopPage();
    }

   
    if (document.getElementById('productDetailContainer')) {
        initProductDetailPage();
    }
});


function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}


function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        const executeSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        };

        searchBtn.addEventListener('click', executeSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') executeSearch();
        });
    }
}


function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let html = '';
    for (let i = 0; i < fullStars; i++) html += '<i class="fa-solid fa-star"></i>';
    if (halfStar) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < emptyStars; i++) html += '<i class="fa-regular fa-star"></i>';

    return html;
}


function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-img-wrapper">
                <a href="product-details.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </a>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category.replace('-', ' ')}</span>
                <a href="product-details.html?id=${product.id}">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span>(${product.reviewsCount})</span>
                </div>
                <div class="product-bottom">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm" onclick='handleAddToCart("${product.id}")'>
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}


function handleAddToCart(productId) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product && typeof addToCart === 'function') {
        addToCart(product, 1);
    }
}


function renderFeaturedProducts() {
    const container = document.getElementById('featuredProductsContainer');
    const featured = MOCK_PRODUCTS.filter(p => p.isFeatured);
    container.innerHTML = featured.map(createProductCard).join('');
}
function initShopPage() {
    const container = document.getElementById('productsContainer');
    const categoryFilterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    const countDisplay = document.getElementById('productCount');

    const urlParams = new URLSearchParams(window.location.search);
    let selectedCategory = urlParams.get('category') || 'all';
    let searchQuery = urlParams.get('search') || '';

    let filteredProducts = [...MOCK_PRODUCTS];

    function applyFilters() {
        filteredProducts = MOCK_PRODUCTS.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesSearch = searchQuery === '' || 
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesCategory && matchesSearch;
        });
        const sortValue = sortSelect ? sortSelect.value : 'default';
        if (sortValue === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'rating') {
            filteredProducts.sort((a, b) => b.rating - a.rating);
        }
        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 0;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--muted-text); margin-bottom: 15px;"></i>
                    <h3>No products found</h3>
                    <p>Try searching with a different keyword or resetting filters.</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredProducts.map(createProductCard).join('');
        }

        if (countDisplay) {
            countDisplay.textContent = `Showing ${filteredProducts.length} of ${MOCK_PRODUCTS.length} products`;
        }
    }
    categoryFilterBtns.forEach(btn => {
        if (btn.dataset.category === selectedCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', (e) => {
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedCategory = e.target.dataset.category;
            applyFilters();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
}
function initProductDetailPage() {
    const detailContainer = document.getElementById('productDetailContainer');
    const relatedContainer = document.getElementById('relatedProductsContainer');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'PROD-101';

    const product = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[0];

    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    if (breadcrumbCategory) breadcrumbCategory.textContent = product.category.replace('-', ' ');
    if (breadcrumbTitle) breadcrumbTitle.textContent = product.title;
    detailContainer.innerHTML = `
        <div class="detail-img-box">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="detail-info">
            <span class="product-category">${product.category.replace('-', ' ')}</span>
            <h1>${product.title}</h1>
            <div class="product-rating">
                ${generateStarRating(product.rating)}
                <span>(${product.reviewsCount} customer reviews)</span>
            </div>
            <div class="detail-price">$${product.price.toFixed(2)}</div>
            <p class="detail-description">${product.description}</p>
            
            <div class="qty-selector">
                <label><strong>Quantity:</strong></label>
                <button class="qty-btn" id="qtyMinus">-</button>
                <input type="number" id="detailQty" class="qty-input" value="1" min="1">
                <button class="qty-btn" id="qtyPlus">+</button>
            </div>

            <button class="btn btn-primary btn-lg" id="addDetailToCartBtn">
                <i class="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
        </div>
    `;

    const qtyInput = document.getElementById('detailQty');
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    });

    document.getElementById('addDetailToCartBtn').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        if (typeof addToCart === 'function') {
            addToCart(product, qty);
        }
    });
    if (relatedContainer) {
        const related = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
        relatedContainer.innerHTML = related.map(createProductCard).join('');
    }
}