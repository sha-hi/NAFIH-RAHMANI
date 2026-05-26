// State Management
let products = JSON.parse(localStorage.getItem('priceCheckerProducts')) || [];
let editingId = null;

// DOM Elements
const productForm = document.getElementById('product-form');
const productNameInput = document.getElementById('product-name');
const realPriceInput = document.getElementById('real-price');
const shopPriceInput = document.getElementById('shop-price');
const productIdInput = document.getElementById('product-id');
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Stats Elements
const statTotal = document.getElementById('stat-total');

// Toolbar Elements
const viewListBtn = document.getElementById('view-list-btn');
const shareAllBtn = document.getElementById('share-all-btn');
const shareSelectedBtn = document.getElementById('share-selected-btn');
const selectAllCheckbox = document.getElementById('select-all');
const selectAllContainer = document.getElementById('select-all-container');

// Modal Elements
const viewListModal = document.getElementById('view-list-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const viewListText = document.getElementById('view-list-text');
const copyListBtn = document.getElementById('copy-list-btn');

// Form Modal Elements
const showAddFormBtn = document.getElementById('show-add-form-btn');
const formModal = document.getElementById('form-modal');
const closeFormBtn = document.getElementById('close-form-btn');

// Format Currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Format Date
const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Calculate Profit Margin
const calculateMargin = (realPrice, shopPrice) => {
    return shopPrice - realPrice;
};

// Save to LocalStorage
const saveToLocalStorage = () => {
    localStorage.setItem('priceCheckerProducts', JSON.stringify(products));
    updateStats();
};

// Update Statistics
const updateStats = () => {
    statTotal.textContent = products.length;
    if (products.length > 0) {
        selectAllContainer.style.display = 'block';
    } else {
        selectAllContainer.style.display = 'none';
    }
};

// Render Products
const renderProducts = (query = '') => {
    productsContainer.innerHTML = '';
    
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredProducts.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        
        // Sort by last updated, newest first
        filteredProducts.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        filteredProducts.forEach(product => {
            const margin = calculateMargin(product.realPrice, product.shopPrice);
            const marginClass = margin >= 0 ? 'profit-positive' : 'profit-negative';
            const marginSign = margin > 0 ? '+' : '';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-info-col">
                    <label class="custom-checkbox-container">
                        <input type="checkbox" class="product-select" data-id="${product.id}">
                        <span class="checkmark"></span>
                    </label>
                    <div class="product-details">
                        <h3 class="product-name">${product.name}</h3>
                        <span class="product-date">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="date-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${formatDate(product.lastUpdated)}
                        </span>
                    </div>
                </div>
                <div class="product-prices-grid">
                    <div class="price-pill real">
                        <span class="price-label">Real Price</span>
                        <span class="price-value">${formatCurrency(product.realPrice)}</span>
                    </div>
                    <div class="price-pill shop">
                        <span class="price-label">Shop Price</span>
                        <span class="price-value">${formatCurrency(product.shopPrice)}</span>
                    </div>
                    <div class="price-pill margin ${marginClass}">
                        <span class="price-label">Margin</span>
                        <span class="price-value">${marginSign}${formatCurrency(margin)}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-icon btn-edit" onclick="editProduct('${product.id}')" title="Edit Product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="btn btn-icon btn-danger" onclick="deleteProduct('${product.id}')" title="Delete Product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            productsContainer.appendChild(card);
        });
    }
    
    // Update select all state
    updateSelectAllCheckbox();
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const card = e.target.closest('.product-card');
            if (e.target.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
            updateSelectAllCheckbox();
        });
    });
};

// Add or Update Product
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = productNameInput.value.trim();
    const realPrice = parseFloat(realPriceInput.value);
    const shopPrice = parseFloat(shopPriceInput.value);
    
    if (!name || isNaN(realPrice) || isNaN(shopPrice)) {
        alert('Please fill out all fields correctly.');
        return;
    }

    if (editingId) {
        // Update existing
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                realPrice,
                shopPrice,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        // Add new
        const newProduct = {
            id: Date.now().toString(),
            name,
            realPrice,
            shopPrice,
            lastUpdated: new Date().toISOString()
        };
        products.push(newProduct);
    }

    saveToLocalStorage();
    renderProducts(searchInput.value);
    closeFormModal();
});

// Edit Product
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    productNameInput.value = product.name;
    realPriceInput.value = product.realPrice;
    shopPriceInput.value = product.shopPrice;
    
    formTitle.textContent = 'Edit Product Details';
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Update Product
    `;
    
    // Show Modal Form
    formModal.classList.remove('hidden');
    productNameInput.focus();
};

// Delete Product
window.deleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        renderProducts(searchInput.value);
        
        // If deleting the product currently being edited, close form modal
        if (editingId === id) {
            closeFormModal();
        }
    }
};

// Close Form Modal
const closeFormModal = () => {
    productForm.reset();
    editingId = null;
    formTitle.textContent = 'Add Product';
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Save Product
    `;
    formModal.classList.add('hidden');
};

// Cancel & Close triggers
cancelBtn.addEventListener('click', closeFormModal);
closeFormBtn.addEventListener('click', closeFormModal);

// Open Form Modal
showAddFormBtn.addEventListener('click', () => {
    editingId = null;
    formTitle.textContent = 'Add Product';
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Save Product
    `;
    formModal.classList.remove('hidden');
    productNameInput.focus();
});

// Search Feature
searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

// Selection Logic
const updateSelectAllCheckbox = () => {
    const checkboxes = document.querySelectorAll('.product-select');
    if (checkboxes.length === 0) {
        selectAllCheckbox.checked = false;
        return;
    }
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selectAllCheckbox.checked = allChecked;
};

selectAllCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.checked = isChecked;
        const card = cb.closest('.product-card');
        if (isChecked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
});

const getSelectedProductIds = () => {
    const selected = [];
    document.querySelectorAll('.product-select:checked').forEach(cb => {
        selected.push(cb.getAttribute('data-id'));
    });
    return selected;
};

// Generate List Text
const generateListText = (selectedIds = null) => {
    let listProducts = products;
    if (selectedIds) {
        listProducts = products.filter(p => selectedIds.includes(p.id));
    }
    
    if (listProducts.length === 0) {
        return "No products selected.";
    }

    let text = "PRICE LIST\n";
    text += "====================\n";
    
    // Sort alphabetically for the text list
    const sorted = [...listProducts].sort((a, b) => a.name.localeCompare(b.name));
    
    sorted.forEach(p => {
        const margin = calculateMargin(p.realPrice, p.shopPrice);
        const marginSign = margin > 0 ? '+' : '';
        text += `• ${p.name}\n  Real: ${formatCurrency(p.realPrice)} | Offered: ${formatCurrency(p.shopPrice)}\n  PROFIT: ${marginSign}${formatCurrency(margin)}\n\n`;
    });
    
    text += "====================\n";
    text += `Total Items: ${listProducts.length}\n`;
    text += `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
    
    return text;
};

// View List Action
viewListBtn.addEventListener('click', () => {
    const text = generateListText();
    viewListText.value = text;
    viewListModal.classList.remove('hidden');
});

// Copy List Action
copyListBtn.addEventListener('click', () => {
    viewListText.select();
    document.execCommand('copy');
    const originalText = copyListBtn.innerHTML;
    copyListBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
    `;
    setTimeout(() => {
        copyListBtn.innerHTML = originalText;
    }, 2000);
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
    viewListModal.classList.add('hidden');
});

// Share Actions
const shareText = (text) => {
    if (navigator.share) {
        navigator.share({
            title: 'Price Checker List',
            text: text,
        }).catch(err => {
            console.error('Error sharing:', err);
            // Fallback to modal if user cancels or it fails
            viewListText.value = text;
            viewListModal.classList.remove('hidden');
        });
    } else {
        // Fallback for desktop/unsupported
        viewListText.value = text;
        viewListModal.classList.remove('hidden');
    }
};

shareAllBtn.addEventListener('click', () => {
    const text = generateListText();
    if (text === "No products selected.") return alert("No products to share.");
    shareText(text);
});

shareSelectedBtn.addEventListener('click', () => {
    const selectedIds = getSelectedProductIds();
    if (selectedIds.length === 0) {
        alert('Please select at least one product to share.');
        return;
    }
    const text = generateListText(selectedIds);
    shareText(text);
});

// Initial Render
updateStats();
renderProducts();
