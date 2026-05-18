//UI Navigation
function navigate(sectionId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if(sectionId === 'home') { loadBooks(); loadCategories(); }
    if(sectionId === 'cart') renderCart();
    if(sectionId === 'authors') loadAuthors();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

//Local State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let booksCache = [];
let authorsCache = [];
let activeCategory = 'all';

function saveLocal() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
}

//API Helper
async function api(url, method = 'GET', data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(url, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw err;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

//Skeleton Loading
function showSkeletonBooks(count = 8) {
    const list = document.getElementById('bookCatalog');
    list.innerHTML = '';
    for(let i = 0; i < count; i++) {
        list.innerHTML += `<div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text price"></div>
        </div>`;
    }
}

//Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    showSkeletonBooks();
    loadBooks();
    loadCategories();
    document.getElementById('cartCount').innerText = cart.length;

    // Search
    let searchTimeout;
    document.getElementById('searchBox').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const q = e.target.value.toLowerCase();
            if(q.length === 0 && activeCategory !== 'all') {
                renderBooks(booksCache.filter(b => b.category && b.category.toLowerCase() === activeCategory.toLowerCase()));
            } else {
                renderBooks(booksCache.filter(b => b.title.toLowerCase().includes(q)));
            }
        }, 200);
    });

    // Register
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const user = { 
            username: document.getElementById('rUser').value, 
            email: document.getElementById('rEmail').value, 
            password: document.getElementById('rPass').value 
        };
        try {
            await api('/api/users/register', 'POST', user);
            showToast('Registration Successful! Please login.');
            navigate('login');
        } catch (err) {
            showToast(err.error || 'Registration failed');
        }
    };

    // Login
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await api('/api/users/login', 'POST', {
                username: document.getElementById('lUser').value,
                password: document.getElementById('lPass').value
            });
            currentUser = user;
            saveLocal();
            showToast('Welcome back!');
            navigate('home');
        } catch (err) {
            showToast('Invalid credentials!');
        }
    };

    // Admin Login
    document.getElementById('adminLoginForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            const admin = await api('/api/admin/login', 'POST', {
                username: document.getElementById('adminUser').value,
                password: document.getElementById('adminPass').value
            });
            localStorage.setItem('currentAdmin', JSON.stringify({ 
                user: admin.username, 
                role: admin.adminLevel || 'Admin' 
            }));
            window.location.href = 'admin.html';
        } catch (err) {
            showToast('Invalid admin credentials!');
        }
    };

    // Profile Update
    document.getElementById('profileForm').onsubmit = async (e) => {
        e.preventDefault();
        if(!currentUser) return;
        const updateData = { email: document.getElementById('pEmail').value };
        const np = document.getElementById('pPass').value;
        if(np) updateData.password = np;
        try {
            const updatedUser = await api(`/api/users/${currentUser.id}`, 'PUT', updateData);
            currentUser = updatedUser;
            saveLocal();
            showToast('Profile Updated!');
        } catch (err) {
            showToast('Failed to update profile.');
        }
    };

    // Checkout
    document.getElementById('checkoutForm').onsubmit = async (e) => {
        e.preventDefault();
        if(cart.length === 0) return showToast('Cart is empty!');
        if(!currentUser) { showToast('Please login to checkout!'); navigate('login'); return; }
        
        const total = cart.reduce((a,b) => a + b.price, 0);
        const orderData = { 
            userId: currentUser.id, 
            totalAmount: total, 
            status: 'Pending', 
            timestamp: new Date().toLocaleDateString() 
        };
        try {
            await api('/api/orders', 'POST', orderData);
            cart = [];
            saveLocal();
            e.target.reset();
            showToast('Payment Successful! Order placed.');
            navigate('profile');
            loadProfileOrders();
        } catch(err) {
            showToast('Failed to save order.');
        }
    };

    // Add Review
    document.getElementById('reviewForm').onsubmit = async (e) => {
        e.preventDefault();
        if(!currentUser) return showToast('Please login to review!');
        const bookId = document.getElementById('detailsContainer').dataset.bookId;
        const reviewData = { 
            bookId: bookId, 
            customerId: currentUser.username, 
            rating: parseInt(document.getElementById('revRating').value), 
            comment: document.getElementById('revText').value 
        };
        try {
            await api('/api/reviews', 'POST', reviewData);
            showToast('Review submitted!');
            e.target.reset();
            loadReviews(bookId);
        } catch(err) {
            showToast('Failed to save review.');
        }
    };
});

//Data Loading
async function loadBooks() {
    try {
        booksCache = await api('/api/books');
        renderBooks(booksCache);
    } catch (err) {
        console.error('Error loading books:', err);
        renderBooks([]);
    }
}

async function loadCategories() {
    try {
        const categories = await api('/api/books/categories');
        renderCategoryBar(categories);
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

async function loadAuthors() {
    try {
        const authors = await api('/api/authors');
        authorsCache = authors;
        renderAuthorsList(authors);
    } catch (err) {
        console.error('Error loading authors:', err);
        renderAuthorsList([]);
    }
}

async function loadReviews(bookId) {
    try {
        const reviews = await api(`/api/reviews/book/${bookId}`);
        renderReviews(reviews);
    } catch (err) {
        console.error('Error loading reviews:', err);
        renderReviews([]);
    }
}

async function loadProfileOrders() {
    if (!currentUser) return;
    try {
        const orders = await api(`/api/orders/user/${currentUser.id}`);
        renderProfileOrders(orders);
    } catch (err) {
        console.error('Error loading orders:', err);
        renderProfileOrders([]);
    }
}

//UI Renderers
function updateAuthUI() {
    if(currentUser) {
        document.getElementById('authLinks').style.display = 'none';
        document.getElementById('userLinks').style.display = 'flex';
        document.getElementById('pEmail').value = currentUser.email || '';
        loadProfileOrders();
    } else {
        document.getElementById('authLinks').style.display = 'flex';
        document.getElementById('userLinks').style.display = 'none';
    }
}

window.logout = () => { currentUser = null; saveLocal(); navigate('home'); showToast('Logged out'); }

// Category colors
const categoryColors = {
    'fiction': { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
    'non-fiction': { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    'romance': { bg: 'rgba(244,114,182,0.12)', color: '#f472b6' },
    'historical': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    'science fiction': { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    'mystery': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
    'fantasy': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
    'biography': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
    'thriller': { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
    'default': { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' }
};

function getCatStyle(cat) {
    if (!cat) return categoryColors['default'];
    return categoryColors[cat.toLowerCase()] || categoryColors['default'];
}

function renderCategoryBar(categories) {
    const bar = document.getElementById('categoryBar');
    bar.innerHTML = `<div class="category-chip ${activeCategory === 'all' ? 'active' : ''}" data-category="all" onclick="filterCategory('all', this)">All Books</div>`;
    categories.forEach(cat => {
        bar.innerHTML += `<div class="category-chip ${activeCategory === cat.toLowerCase() ? 'active' : ''}" data-category="${cat}" onclick="filterCategory('${cat}', this)">${cat}</div>`;
    });
}

window.filterCategory = (category, el) => {
    activeCategory = category.toLowerCase();
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    
    if(activeCategory === 'all') {
        renderBooks(booksCache);
    } else {
        renderBooks(booksCache.filter(b => b.category && b.category.toLowerCase() === activeCategory));
    }
    document.getElementById('searchBox').value = '';
};

function renderBooks(books) {
    const list = document.getElementById('bookCatalog'); list.innerHTML = '';
    if(books.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:var(--text-muted); grid-column:1/-1; padding:60px 0;">
            <i class="fas fa-book-open" style="font-size:3rem; opacity:0.2; display:block; margin-bottom:16px;"></i>
            <p>No books found in this category.</p>
        </div>`;
        return;
    }
    books.forEach(b => {
        const catStyle = getCatStyle(b.category);
        const imgHtml = b.image && b.image.trim() !== '' 
            ? `<img class="book-img" src="${b.image}" alt="${b.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'book-img-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">`
            : `<div class="book-img-placeholder"><i class="fas fa-book"></i></div>`;
        
        list.innerHTML += `<div class="glass-panel book-card" onclick="viewBook('${b.id}')">
            <div class="book-img-wrap">${imgHtml}</div>
            <div class="book-card-body">
                <div class="book-title">${b.title}</div>
                <div class="book-author">by ${b.author}</div>
                ${b.category ? `<span class="book-category-tag" style="background:${catStyle.bg};color:${catStyle.color};width:fit-content;">${b.category}</span>` : ''}
                <div class="book-meta">
                    <div class="book-price">$${b.price.toFixed(2)}</div>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${b.id}')" style="border-radius:50%;width:36px;height:36px;padding:0;justify-content:center;"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        </div>`;
    });
}

window.viewBook = (id) => {
    const b = booksCache.find(x => x.id === id);
    if(!b) return;
    const c = document.getElementById('detailsContainer');
    c.dataset.bookId = id;
    const catStyle = getCatStyle(b.category);
    
    const imgHtml = b.image && b.image.trim() !== ''
        ? `<img class="detail-img" src="${b.image}" alt="${b.title}" onerror="this.outerHTML='<div class=\\'detail-img-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">`
        : `<div class="detail-img-placeholder"><i class="fas fa-book"></i></div>`;
    
    c.innerHTML = `
        <div style="display:flex; gap:40px; flex-wrap:wrap;">
            ${imgHtml}
            <div style="flex:1; min-width:280px;">
                ${b.category ? `<span class="book-category-tag" style="background:${catStyle.bg};color:${catStyle.color};margin-bottom:16px;display:inline-block;">${b.category}</span>` : ''}
                <h1 style="font-size:2.5rem; margin-bottom:8px; line-height:1.2;">${b.title}</h1>
                <p style="color:var(--text-muted); font-size:1.15rem; margin-bottom:24px;">by ${b.author}</p>
                <div style="display:flex; align-items:baseline; gap:16px; margin-bottom:8px;">
                    <span style="font-size:2rem; font-weight:700; color:var(--primary); font-family:'Inter',sans-serif;">$${b.price.toFixed(2)}</span>
                </div>
                ${b.stock > 0 
                    ? `<p style="color:var(--success); margin-bottom:28px; font-size:0.9rem;"><i class="fas fa-check-circle"></i> ${b.stock} copies available</p>` 
                    : '<p style="color:var(--danger); margin-bottom:28px; font-size:0.9rem;"><i class="fas fa-times-circle"></i> Out of stock</p>'}
                <button class="btn btn-primary" onclick="addToCart('${b.id}')" style="padding:14px 32px; font-size:1rem;"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
            </div>
        </div>`;
    loadReviews(id);
    navigate('book-details');
};

function renderReviews(reviews) {
    const list = document.getElementById('reviewsList'); list.innerHTML = '';
    if(reviews.length === 0) { 
        list.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">
            <i class="fas fa-comment-dots" style="font-size:2rem; opacity:0.2; display:block; margin-bottom:12px;"></i>
            <p>No reviews yet. Be the first!</p>
        </div>`; 
        return; 
    }
    reviews.forEach(r => {
        const rating = r.rating || 0;
        list.innerHTML += `<div class="glass-panel" style="padding:20px">
            <div style="color:var(--primary); margin-bottom:8px; font-size:1.1rem;">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
            <p style="font-style:italic; line-height:1.6;">"${r.comment}"</p>
            <small class="text-muted" style="margin-top:8px; display:block;">— ${r.customerId}</small>
        </div>`;
    });
}

window.addToCart = (id) => {
    const b = booksCache.find(x => x.id === id);
    if(b) { 
        cart.push(b); saveLocal(); 
        document.getElementById('cartCount').innerText = cart.length; 
        showToast(`"${b.title}" added to cart`); 
    }
};

window.removeFromCart = (index) => { cart.splice(index, 1); saveLocal(); renderCart(); }

function renderCart() {
    const list = document.getElementById('cartItemsList'); list.innerHTML = '';
    let total = 0;
    if(cart.length===0) {
        list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">
            <i class="fas fa-shopping-bag" style="font-size:2.5rem; opacity:0.15; display:block; margin-bottom:12px;"></i>
            <p>Your cart is empty</p>
        </div>`;
    }
    cart.forEach((c, i) => {
        total += c.price;
        list.innerHTML += `<div class="cart-item">
            <div style="display:flex; gap:14px; align-items:center;">
                ${c.image && c.image.trim() !== '' ? `<img src="${c.image}" style="width:45px; height:65px; object-fit:cover; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.3);" onerror="this.style.display='none'">` : ''}
                <div><strong>${c.title}</strong> <br> <small class="text-muted">${c.author}</small></div>
            </div>
            <div style="display:flex; gap:16px; align-items:center;">
                <span style="font-weight:600; color:var(--primary);">$${c.price.toFixed(2)}</span>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    });
    document.getElementById('cartTotalText').innerText = `Total: $${total.toFixed(2)}`;
    document.getElementById('cartCount').innerText = cart.length;
}

function renderProfileOrders(orders) {
    const list = document.getElementById('userOrdersList'); list.innerHTML = '';
    if(!currentUser) return;
    if(!orders || orders.length === 0) { 
        list.innerHTML = '<p class="text-muted" style="font-size:0.9rem;">No orders placed yet.</p>'; 
        return; 
    }
    orders.forEach(o => {
        list.innerHTML += `<div class="glass-panel" style="padding:18px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div><strong style="font-family:'Inter',sans-serif;">#${o.id.substring(0,8)}</strong> <br> <small class="text-muted">${o.timestamp}</small></div>
            <div style="text-align:right"><strong style="color:var(--primary); font-family:'Inter',sans-serif;">$${o.totalAmount.toFixed(2)}</strong> <br> <span class="badge ${o.status==='Pending'?'badge-pending':'badge-success'}">${o.status}</span></div>
        </div>`;
    });
}

function renderAuthorsList(authors) {
    const list = document.getElementById('authorsList'); list.innerHTML = '';
    if(authors.length === 0) {
        list.innerHTML = '<p class="text-muted" style="text-align:center; grid-column:1/-1;">No authors found.</p>';
        return;
    }
    authors.forEach(a => {
        // Count books by this author
        const bookCount = booksCache.filter(b => b.author && b.author.toLowerCase() === a.name.toLowerCase()).length;
        list.innerHTML += `<div class="glass-panel author-card-clickable" style="padding:32px; text-align:center;" onclick="viewAuthor('${a.id}')">
            <div class="avatar" style="width:72px; height:72px; margin:0 auto 16px; font-size:1.5rem;"><i class="fas fa-user-tie"></i></div>
            <h3 style="margin-bottom:4px;">${a.name}</h3>
            <p class="text-muted" style="margin-bottom:8px; font-size:0.85rem;">${a.genre || ''}</p>
            <p style="font-size:0.85rem; line-height:1.6; color:var(--text-muted); margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${a.bio}</p>
            <div style="display:flex; justify-content:center; gap:16px; align-items:center; margin-bottom:14px;">
                <span style="font-size:0.8rem; color:var(--text-muted); font-family:'Inter',sans-serif;"><i class="fas fa-book" style="color:#6FD1D7; margin-right:4px;"></i>${bookCount} Book${bookCount !== 1 ? 's' : ''}</span>
            </div>
            <span class="author-view-link" style="color:#6FD1D7; font-size:0.85rem; font-weight:500; font-family:'Inter',sans-serif;">View Profile <i class="fas fa-arrow-right" style="font-size:0.75rem;"></i></span>
        </div>`;
    });
}

//Author Detail
window.viewAuthor = async (authorId) => {
    // Find author from cache or fetch
    let author = authorsCache.find(a => a.id === authorId);
    if (!author) {
        try {
            const authors = await api('/api/authors');
            authorsCache = authors;
            author = authors.find(a => a.id === authorId);
        } catch(err) {
            showToast('Failed to load author.');
            return;
        }
    }
    if (!author) { showToast('Author not found.'); return; }

    // Ensure books are loaded
    if (booksCache.length === 0) {
        try { booksCache = await api('/api/books'); } catch(e) { /* ignore */ }
    }

    renderAuthorDetail(author);
    navigate('author-detail');
};

function renderAuthorDetail(author) {
    const container = document.getElementById('authorDetailContainer');
    
    // Find books by this author
    const authorBooks = booksCache.filter(b => 
        b.author && b.author.toLowerCase() === author.name.toLowerCase()
    );

    // Calculate stats
    const totalBooks = authorBooks.length;
    const genres = [...new Set(authorBooks.map(b => b.category).filter(Boolean))];
    const avgPrice = totalBooks > 0 
        ? (authorBooks.reduce((sum, b) => sum + b.price, 0) / totalBooks).toFixed(2) 
        : '0.00';

    // Build books grid HTML
    let booksHtml = '';
    if (authorBooks.length === 0) {
        booksHtml = `<div style="text-align:center; color:var(--text-muted); grid-column:1/-1; padding:60px 0;">
            <i class="fas fa-book-open" style="font-size:3rem; opacity:0.2; display:block; margin-bottom:16px;"></i>
            <p>No books found by this author.</p>
        </div>`;
    } else {
        authorBooks.forEach(b => {
            const catStyle = getCatStyle(b.category);
            const imgHtml = b.image && b.image.trim() !== '' 
                ? `<img class="book-img" src="${b.image}" alt="${b.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'book-img-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">`
                : `<div class="book-img-placeholder"><i class="fas fa-book"></i></div>`;
            
            booksHtml += `<div class="glass-panel book-card" onclick="viewBook('${b.id}')">
                <div class="book-img-wrap">${imgHtml}</div>
                <div class="book-card-body">
                    <div class="book-title">${b.title}</div>
                    <div class="book-author">by ${b.author}</div>
                    ${b.category ? `<span class="book-category-tag" style="background:${catStyle.bg};color:${catStyle.color};width:fit-content;">${b.category}</span>` : ''}
                    <div class="book-meta">
                        <div class="book-price">$${b.price.toFixed(2)}</div>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${b.id}')" style="border-radius:50%;width:36px;height:36px;padding:0;justify-content:center;"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>`;
        });
    }

    container.innerHTML = `
        <!-- Author Profile Hero -->
        <div class="glass-panel author-profile-hero">
            <div class="author-profile-header">
                <div class="author-profile-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="author-profile-info">
                    <h1 class="author-profile-name">${author.name}</h1>
                    ${author.genre ? `<span class="author-profile-genre">${author.genre}</span>` : ''}
                    <p class="author-profile-bio">${author.bio}</p>
                    <div class="author-stats">
                        <div class="author-stat">
                            <i class="fas fa-book"></i>
                            <div>
                                <div class="author-stat-value">${totalBooks}</div>
                                <div class="author-stat-label">Books</div>
                            </div>
                        </div>
                        <div class="author-stat">
                            <i class="fas fa-tags"></i>
                            <div>
                                <div class="author-stat-value">${genres.length}</div>
                                <div class="author-stat-label">Genre${genres.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div class="author-stat">
                            <i class="fas fa-dollar-sign"></i>
                            <div>
                                <div class="author-stat-value">$${avgPrice}</div>
                                <div class="author-stat-label">Avg. Price</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Author's Books -->
        <div class="author-books-header">
            <h3>Books by ${author.name}</h3>
        </div>
        <div class="section-divider" style="margin:0 0 24px;"></div>
        <div class="grid-4">${booksHtml}</div>
    `;
}
