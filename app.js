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

// Form Toggle Elements
const showAddFormBtn = document.getElementById('show-add-form-btn');
const formSection = document.getElementById('form-section');

// Format Currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Format Date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
        selectAllContainer.style.display = 'flex';
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
                <div class="product-header">
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <input type="checkbox" class="product-select" data-id="${product.id}">
                        <h3 class="product-name">${product.name}</h3>
                    </div>
                    <span class="product-date">Updated: ${formatDate(product.lastUpdated)}</span>
                </div>
                <div class="product-prices">
                    <div class="price-item">
                        <span class="price-label">Real Price</span>
                        <span class="price-value">${formatCurrency(product.realPrice)}</span>
                    </div>
                    <div class="price-item">
                        <span class="price-label">Shop Price</span>
                        <span class="price-value">${formatCurrency(product.shopPrice)}</span>
                    </div>
                    <div class="price-item">
                        <span class="price-label">Difference</span>
                        <span class="price-value ${marginClass}">${marginSign}${formatCurrency(margin)}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit btn-sm" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            `;
            productsContainer.appendChild(card);
        });
    }
    
    // Update select all state
    updateSelectAllCheckbox();
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.addEventListener('change', updateSelectAllCheckbox);
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
        resetForm();
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
    resetForm();
});

// Edit Product
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;
    productNameInput.value = product.name;
    realPriceInput.value = product.realPrice;
    shopPriceInput.value = product.shopPrice;
    
    formTitle.textContent = 'Edit Product';
    saveBtn.textContent = 'Update Product';
    cancelBtn.classList.remove('hidden');
    
    // Show form and hide add button
    formSection.classList.remove('hidden');
    showAddFormBtn.classList.add('hidden');
    
    // Scroll to form
    formSection.scrollIntoView({ behavior: 'smooth' });
};

// Delete Product
window.deleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        renderProducts(searchInput.value);
        
        // If deleting the product currently being edited, reset form
        if (editingId === id) {
            resetForm();
        }
    }
};

// Reset Form
const resetForm = () => {
    productForm.reset();
    editingId = null;
    formTitle.textContent = 'Add Product';
    saveBtn.textContent = 'Save Product';
    cancelBtn.classList.add('hidden');
    
    // Hide form and show add button
    formSection.classList.add('hidden');
    showAddFormBtn.classList.remove('hidden');
};

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

// Show Add Form Toggle
showAddFormBtn.addEventListener('click', () => {
    formSection.classList.remove('hidden');
    showAddFormBtn.classList.add('hidden');
    productNameInput.focus();
    
    // Ensure Cancel button acts as a way to just hide it when not editing
    cancelBtn.classList.remove('hidden');
    cancelBtn.textContent = 'Cancel';
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

    let text = "PRICE LIST\\n";
    text += "----------\\n";
    
    // Sort alphabetically for the text list
    const sorted = [...listProducts].sort((a, b) => a.name.localeCompare(b.name));
    
    sorted.forEach(p => {
        text += `${p.name} - Shop Price: ${formatCurrency(p.shopPrice)} (Real: ${formatCurrency(p.realPrice)})\\n`;
    });
    
    text += "----------\\n";
    text += `Total Items: ${listProducts.length}\\n`;
    text += `Generated on: ${formatDate(new Date().toISOString())}`;
    
    return text.replace(/\\n/g, '\n'); // handle literal escaped newlines just in case
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
    const originalText = copyListBtn.textContent;
    copyListBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyListBtn.textContent = originalText;
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
