// --- Admin Navigation & Core ---
let logs = JSON.parse(localStorage.getItem('logs')) || [];

// --- API Helper ---
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

function addLog(msg, type='info') {
    logs.unshift({ time: new Date().toLocaleTimeString(), msg, type });
    if(logs.length > 50) logs.pop();
    localStorage.setItem('logs', JSON.stringify(logs));
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if(item.getAttribute('href') === 'index.html') return;
        e.preventDefault();
        const target = item.getAttribute('data-target');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById(target).classList.add('active');

        // Update header title
        const titles = {
            'dashboard': 'Dashboard', 'manage-books': 'Inventory',
            'manage-orders': 'Orders', 'manage-authors': 'Authors',
            'manage-staff': 'Staff', 'system-logs': 'System Logs',
            'manage-reviews': 'Reviews'
        };
        document.querySelector('.header h2').textContent = titles[target] || 'Dashboard';
        refreshData();
    });
});

window.openModal = (id) => document.getElementById(id).classList.add('active');
window.closeModal = (id) => document.getElementById(id).classList.remove('active');

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => { 
    if(!localStorage.getItem('currentAdmin')) {
        window.location.href = 'index.html';
        return;
    }
    const adminUser = JSON.parse(localStorage.getItem('currentAdmin'));
    const userInfoEl = document.querySelector('.user-info');
    if(userInfoEl && adminUser.user) userInfoEl.innerText = `${adminUser.user} · ${adminUser.role}`;
    
    refreshData(); 
    addLog(`Admin ${adminUser.user} accessed dashboard.`, 'info'); 
});

window.logoutAdmin = () => {
    localStorage.removeItem('currentAdmin');
    window.location.href = 'index.html';
};

// --- Load all data ---
async function refreshData() {
    try {
        const [books, authors, orders, reviews, users] = await Promise.all([
            api('/api/books'),
            api('/api/authors'),
            api('/api/orders'),
            api('/api/reviews'),
            api('/api/users')
        ]);

        // Stats
        document.getElementById('statBooks').innerText = books.length;
        document.getElementById('statUsers').innerText = users.length;
        document.getElementById('statOrders').innerText = orders.length;
        document.getElementById('statRevenue').innerText = '$' + orders.reduce((a,b) => a + (b.totalAmount || 0), 0).toFixed(2);

        renderBooksTable(books, authors);
        renderOrdersTable(orders);
        renderAuthorsTable(authors);
        renderReviewsTable(reviews, books);
        renderLogs();
    } catch (err) {
        console.error('Error refreshing data:', err);
    }
}

// --- Books ---
function renderBooksTable(books, authors) {
    const tb = document.getElementById('adminBooksTable'); tb.innerHTML='';
    books.forEach(b => {
        const imgCell = b.image && b.image.trim() !== '' 
            ? `<img src="${b.image}" style="width:36px;height:52px;object-fit:cover;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);" onerror="this.outerHTML='<i class=\\'fas fa-book\\' style=\\'color:var(--text-muted);opacity:0.3\\'></i>'">`
            : '<i class="fas fa-book" style="color:var(--text-muted);opacity:0.3"></i>';
        const catStyle = getCategoryBadge(b.category);
        tb.innerHTML += `<tr>
            <td>${imgCell}</td>
            <td style="font-weight:500;">${b.title}</td>
            <td class="text-muted">${b.author}</td>
            <td><span class="badge" style="background:${catStyle.bg};color:${catStyle.color};">${b.category || 'N/A'}</span></td>
            <td style="font-weight:600; color:var(--primary);">$${b.price}</td>
            <td><span class="badge badge-success">${b.stock || 0}</span></td>
            <td><button class="btn btn-danger btn-sm" onclick="delBook('${b.id}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
    
    const sel = document.getElementById('bAuthor'); sel.innerHTML='';
    authors.forEach(a => sel.innerHTML += `<option value="${a.name}">${a.name}</option>`);
}

function getCategoryBadge(cat) {
    const map = {
        'fiction': { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
        'non-fiction': { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
        'romance': { bg: 'rgba(244,114,182,0.12)', color: '#f472b6' },
        'historical': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    };
    if (!cat) return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    return map[cat.toLowerCase()] || { bg: 'rgba(212,175,55,0.08)', color: '#d4af37' };
}

document.getElementById('bookForm').onsubmit = async (e) => {
    e.preventDefault();
    const book = { 
        title: document.getElementById('bTitle').value, 
        author: document.getElementById('bAuthor').value, 
        price: parseFloat(document.getElementById('bPrice').value),
        stock: parseInt(document.getElementById('bStock').value) || 0,
        image: document.getElementById('bImage').value || '',
        category: document.getElementById('bCategory').value || 'Uncategorized'
    };
    try {
        await api('/api/books', 'POST', book);
        closeModal('bookModal'); 
        e.target.reset();
        showToast('Book saved successfully!'); 
        addLog(`Added book: ${book.title}`, 'info'); 
        refreshData();
    } catch(err) {
        showToast('Failed to add book.');
    }
};

window.delBook = async (id) => { 
    if(confirm('Delete this book?')) { 
        try {
            await api(`/api/books/${id}`, 'DELETE');
            refreshData(); 
            addLog('Deleted a book from inventory.', 'warning'); 
        } catch(err) {
            showToast('Failed to delete book.');
        }
    } 
};

// --- Orders ---
function renderOrdersTable(orders) {
    const tb = document.getElementById('adminOrdersTable'); tb.innerHTML='';
    orders.forEach(o => {
        tb.innerHTML += `<tr>
            <td style="font-family:monospace; font-size:0.85rem;">#${o.id.substring(0,8)}</td>
            <td>${o.userId}</td><td class="text-muted">${o.timestamp}</td>
            <td style="font-weight:600; color:var(--primary);">$${o.totalAmount.toFixed(2)}</td>
            <td><span class="badge ${o.status==='Pending'?'badge-pending':'badge-success'}">${o.status}</span></td>
            <td>${o.status==='Pending' ? `<button class="btn btn-primary btn-sm" onclick="shipOrder('${o.id}')"><i class="fas fa-truck"></i> Ship</button>` : '<span class="text-muted" style="font-size:0.8rem;">Completed</span>'}</td>
        </tr>`;
    });
}

window.shipOrder = async (id) => { 
    try {
        await api(`/api/orders/${id}`, 'PUT', { status: 'Shipped' });
        showToast('Order marked as shipped!'); 
        addLog('Shipped an order.', 'info');
        refreshData(); 
    } catch(err) {
        showToast('Failed to update order.');
    }
};

// --- Authors ---
function renderAuthorsTable(authors) {
    const tb = document.getElementById('adminAuthorsTable'); tb.innerHTML='';
    authors.forEach(a => {
        tb.innerHTML += `<tr>
            <td style="font-weight:500;">${a.name}</td>
            <td><span class="badge" style="background:rgba(212,175,55,0.08);color:var(--primary);">${a.genre}</span></td>
            <td class="text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.bio}</td>
            <td><button class="btn btn-danger btn-sm" onclick="delAuthor('${a.id}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
}

document.getElementById('authorForm').onsubmit = async (e) => {
    e.preventDefault();
    const author = { 
        name: document.getElementById('aName').value, 
        genre: document.getElementById('aGenre').value, 
        bio: document.getElementById('aBio').value 
    };
    try {
        await api('/api/authors', 'POST', author);
        closeModal('authorModal'); 
        e.target.reset(); 
        refreshData(); 
        showToast('Author saved!');
        addLog(`Added author: ${author.name}`, 'info');
    } catch(err) {
        showToast('Failed to add author.');
    }
};

window.delAuthor = async (id) => { 
    if(confirm('Delete author?')) {
        try {
            await api(`/api/authors/${id}`, 'DELETE');
            refreshData();
            addLog('Deleted an author.', 'warning');
        } catch(err) {
            showToast('Failed to delete author.');
        }
    }
};

// --- Staff ---
const staff = JSON.parse(localStorage.getItem('staff')) || [{ user: 'admin', email: 'admin@booque.com', role: 'SuperAdmin' }];

function renderStaffTable() {
    const tb = document.getElementById('adminStaffTable'); tb.innerHTML='';
    staff.forEach((s,i) => {
        tb.innerHTML += `<tr>
            <td style="font-weight:500;">${s.user}</td>
            <td class="text-muted">${s.email}</td>
            <td><span class="badge badge-pending">${s.role}</span></td>
            <td>${s.user!=='admin'?`<button class="btn btn-danger btn-sm" onclick="delStaff(${i})"><i class="fas fa-trash"></i></button>`:''}</td>
        </tr>`;
    });
}

document.getElementById('staffForm').onsubmit = e => {
    e.preventDefault();
    staff.push({ user: document.getElementById('sUser').value, email: document.getElementById('sEmail').value, pass: document.getElementById('sPass').value, role: document.getElementById('sRole').value });
    localStorage.setItem('staff', JSON.stringify(staff));
    closeModal('staffModal'); e.target.reset(); refreshData(); showToast('Staff member added!');
};
window.delStaff = (i) => { staff.splice(i,1); localStorage.setItem('staff', JSON.stringify(staff)); refreshData(); };

// --- Logs with Glowing Dots ---
function renderLogs() {
    const lc = document.getElementById('logContainer'); lc.innerHTML='';
    if(logs.length === 0) {
        lc.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">No activity logged yet.</p>';
    }
    logs.forEach(l => {
        const dotClass = l.type === 'danger' ? 'danger' : (l.type === 'warning' ? 'warning' : 'info');
        lc.innerHTML += `<div style="padding:12px 0; border-bottom:1px solid var(--glass-border); display:flex; gap:14px; align-items:center;">
            <span class="status-dot ${dotClass}"></span>
            <span class="text-muted" style="width:72px; font-size:0.8rem; font-family:monospace; flex-shrink:0;">${l.time}</span>
            <span style="font-size:0.9rem;">${l.msg}</span>
        </div>`;
    });
    renderStaffTable();
}

// --- Reviews ---
function renderReviewsTable(reviews, books) {
    const tb = document.getElementById('adminReviewsTable'); tb.innerHTML='';
    reviews.forEach(r => {
        const b = books.find(x => x.id === r.bookId);
        tb.innerHTML += `<tr>
            <td style="font-weight:500;">${b?b.title:'Unknown'}</td>
            <td class="text-muted">${r.customerId}</td>
            <td><span style="color:var(--primary);">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;color:var(--text-muted);">"${r.comment}"</td>
            <td><button class="btn btn-danger btn-sm" onclick="delReview('${r.id}')"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
}

window.delReview = async (id) => { 
    if(confirm('Delete review?')) {
        try {
            await api(`/api/reviews/${id}`, 'DELETE');
            refreshData(); 
            showToast('Review deleted.');
            addLog('Moderated a review.', 'warning');
        } catch(err) {
            showToast('Failed to delete review.');
        }
    }
};
