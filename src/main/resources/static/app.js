document.addEventListener('DOMContentLoaded', () => {
    // Navigation routing
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // If navigating to Book Inventory, load books
            if (targetId === 'c2-inventory') {
                loadBooks();
            }
        });
    });

    // Book Inventory Logic (Component 2)
    const modal = document.getElementById('addBookModal');
    const addBtn = document.getElementById('addBookBtn');
    const closeBtn = document.querySelector('.close-btn');

    if(addBtn) {
        addBtn.onclick = () => modal.classList.add('active');
        closeBtn.onclick = () => modal.classList.remove('active');
        window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    }

    const bookForm = document.getElementById('addBookForm');
    if(bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const book = {
                title: document.getElementById('title').value,
                author: document.getElementById('authorId').value,
                price: parseFloat(document.getElementById('price').value)
            };

            try {
                const response = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(book)
                });
                if (response.ok) {
                    modal.classList.remove('active');
                    e.target.reset();
                    loadBooks();
                }
            } catch (error) { console.error('Error:', error); }
        });
    }

    async function loadBooks() {
        try {
            const response = await fetch('/api/books');
            const books = await response.json();
            
            const tbody = document.getElementById('booksTableBody');
            tbody.innerHTML = '';

            books.forEach(book => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.authorId}</td>
                    <td><span class="tag">Physical Book</span></td>
                    <td>$${book.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteBook('${book.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading books:', error);
            // Fallback mock data if API is not running
            document.getElementById('booksTableBody').innerHTML = `
                <tr><td>Harry Potter</td><td>Author_01</td><td><span class="tag">Physical</span></td><td>$25.00</td><td><button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button></td></tr>
                <tr><td>Lord of the Rings</td><td>Author_02</td><td><span class="tag">Digital</span></td><td>$15.00</td><td><button class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button></td></tr>
            `;
        }
    }

    window.deleteBook = async (id) => {
        if (confirm('Delete this book?')) {
            try {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if (response.ok) loadBooks();
            } catch (error) { console.error('Error:', error); }
        }
    };
});
