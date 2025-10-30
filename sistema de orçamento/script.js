/**
 * Sistema de Orçamento Profissional - The Office
 * Versão com Catálogo de Produtos
 */

// ===== ESTADO GLOBAL =====
let products = [];
let catalogProducts = [];
let clientInfo = { name: '', email: '', phone: '', address: '' };
let budgetInfo = {
    number: 'ORC-' + Date.now().toString().slice(-6),
    date: new Date().toISOString().split('T')[0],
    validUntil: getValidUntilDate(),
    discount: 0,
    tax: 0
};

// ===== FUNÇÕES UTILITÁRIAS =====
function getValidUntilDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

// ===== GERENCIAMENTO DE CATÁLOGO =====
function openCatalog() {
    document.getElementById('catalogModal').classList.add('active');
}

function closeCatalog() {
    document.getElementById('catalogModal').classList.remove('active');
}

function addCatalogProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value) || 0;
    const image = document.getElementById('newProductImage').value.trim();

    if (!name || price <= 0) {
        alert('Preencha nome e preço válidos!');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name,
        price,
        image: image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/%3E%3C/svg%3E'
    };

    catalogProducts.push(newProduct);
    saveCatalogToStorage();
    renderCatalog();
    
    // Limpar formulário
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductImage').value = '';
    
    alert('Produto adicionado ao catálogo com sucesso!');
}

function deleteCatalogProduct(id) {
    if (confirm('Deseja remover este produto do catálogo?')) {
        catalogProducts = catalogProducts.filter(p => p.id !== id);
        saveCatalogToStorage();
        renderCatalog();
    }
}

function addFromCatalog(id) {
    const catalogProduct = catalogProducts.find(p => p.id === id);
    if (!catalogProduct) return;

    const newProduct = {
        id: Date.now(),
        description: catalogProduct.name,
        quantity: 1,
        unitPrice: catalogProduct.price,
        total: catalogProduct.price,
        image: catalogProduct.image
    };

    products.push(newProduct);
    renderProducts();
    calculateTotals();
    closeCatalog();
}

function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    
    if (catalogProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-catalog">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p style="font-size: 18px; font-weight: 600;">Nenhum produto no catálogo</p>
                <p style="margin-top: 10px;">Adicione produtos usando o formulário acima</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = catalogProducts.map(product => `
        <div class="catalog-item">
            <img src="${product.image}" alt="${product.name}" class="catalog-item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;%3E%3Cpath stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4&quot;/%3E%3C/svg%3E'">
            <div class="catalog-item-info">
                <div class="catalog-item-name">${product.name}</div>
                <div class="catalog-item-price">${formatCurrency(product.price)}</div>
            </div>
            <div class="catalog-item-actions">
                <button class="btn btn-primary btn-sm" onclick="addFromCatalog(${product.id})" style="flex: 1;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Adicionar
                </button>
                <button class="btn btn-icon" onclick="deleteCatalogProduct(${product.id})">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== GERENCIAMENTO DE PRODUTOS DO ORÇAMENTO =====
function addCustomProduct() {
    const newProduct = {
        id: Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/%3E%3C/svg%3E'
    };
    
    products.push(newProduct);
    renderProducts();
    calculateTotals();
}

function updateProduct(id, field, value) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (field === 'description') {
        product.description = value;
    } else if (field === 'quantity') {
        product.quantity = Math.max(1, parseInt(value) || 1);
        product.total = product.quantity * product.unitPrice;
    } else if (field === 'unitPrice') {
        product.unitPrice = Math.max(0, parseFloat(value) || 0);
        product.total = product.quantity * product.unitPrice;
    } else if (field === 'image') {
        product.image = value || product.image;
    }
    
    renderProducts();
    calculateTotals();
}

function removeProduct(id) {
    if (confirm('Deseja remover este item do orçamento?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
        calculateTotals();
    }
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p style="font-size: 16px;">Nenhum item adicionado</p>
                <p style="font-size: 14px; margin-top: 10px;">Clique no botão acima ou abra o catálogo</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-item fade-in">
            <img src="${product.image}" alt="Produto" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; fill=&quot;none&quot; viewBox=&quot;0 0 24 24&quot; stroke=&quot;currentColor&quot;%3E%3Cpath stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4&quot;/%3E%3C/svg%3E'">
            <div class="product-info">
                <div class="form-group" style="margin-bottom: 10px;">
                    <textarea class="form-control" 
                             placeholder="Descrição do produto/serviço"
                             rows="2"
                             onchange="updateProduct(${product.id}, 'description', this.value)">${product.description}</textarea>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 11px;">URL da Imagem (opcional)</label>
                    <input type="url" 
                           class="form-control" 
                           placeholder="https://exemplo.com/imagem.jpg"
                           value="${product.image.startsWith('data:') ? '' : product.image}"
                           onchange="updateProduct(${product.id}, 'image', this.value)"
                           style="font-size: 12px; padding: 8px 12px;">
                </div>
            </div>
            <div class="product-values">
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Qtd.</label>
                    <input type="number" 
                           class="form-control" 
                           min="1" 
                           value="${product.quantity}"
                           onchange="updateProduct(${product.id}, 'quantity', this.value)">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Preço Unit.</label>
                    <input type="number" 
                           class="form-control" 
                           min="0" 
                           step="0.01"
                           value="${product.unitPrice}"
                           onchange="updateProduct(${product.id}, 'unitPrice', this.value)">
                </div>
                <div>
                    <label style="font-size: 11px; font-weight: 600; color: #3b82f6; display: block; margin-bottom: 3px;">Total</label>
                    <div class="product-total">${formatCurrency(product.total)}</div>
                </div>
                <button class="btn btn-icon" onclick="removeProduct(${product.id})" style="margin-top: 20px;">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== CÁLCULOS =====
function calculateTotals() {
    const subtotal = products.reduce((sum, product) => sum + product.total, 0);
    const discountAmount = (subtotal * budgetInfo.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * budgetInfo.tax) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    updateTotalsDisplay({ subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total });
    return { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total };
}

function updateTotalsDisplay(totals) {
    const subtotalEl = document.getElementById('subtotal');
    const discountRow = document.getElementById('discountRow');
    const discountLabel = document.getElementById('discountLabel');
    const discountAmount = document.getElementById('discountAmount');
    const taxRow = document.getElementById('taxRow');
    const taxLabel = document.getElementById('taxLabel');
    const taxAmount = document.getElementById('taxAmount');
    const totalAmount = document.getElementById('totalAmount');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
    
    if (budgetInfo.discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (discountLabel) discountLabel.textContent = `Desconto (${budgetInfo.discount}%):`;
        if (discountAmount) discountAmount.textContent = `- ${formatCurrency(totals.discountAmount)}`;
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    if (budgetInfo.tax > 0) {
        if (taxRow) taxRow.style.display = 'flex';
        if (taxLabel) taxLabel.textContent = `Impostos (${budgetInfo.tax}%):`;
        if (taxAmount) taxAmount.textContent = formatCurrency(totals.taxAmount);
    } else {
        if (taxRow) taxRow.style.display = 'none';
    }

    if (totalAmount) totalAmount.textContent = formatCurrency(totals.total);
}

// ===== ARMAZENAMENTO LOCAL =====
function saveCatalogToStorage() {
    const data = JSON.stringify(catalogProducts);
    const storageData = { data, timestamp: Date.now() };
    document.cookie = `catalog=${JSON.stringify(storageData)}; path=/; max-age=31536000`;
}

function loadCatalogFromStorage() {
    const cookies = document.cookie.split(';');
    const catalogCookie = cookies.find(c => c.trim().startsWith('catalog='));
    
    if (catalogCookie) {
        try {
            const storageData = JSON.parse(catalogCookie.split('=')[1]);
            catalogProducts = JSON.parse(storageData.data);
        } catch (e) {
            console.log('Erro ao carregar catálogo:', e);
        }
    }
}

// ===== GERAÇÃO DE PDF =====
function generatePDF() {
    const totals = calculateTotals();
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Orçamento ${budgetInfo.number}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.4; }
                
                .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 25px; }
                .header-content { display: flex; justify-content: space-between; align-items: center; }
                
                .logo-container { display: flex; align-items: center; gap: 15px; }
                .logo { position: relative; width: 80px; height: 50px; background: #000; border-radius: 8px; padding: 8px; }
                .logo-circle { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; background: #c2754f; border-radius: 50%; }
                .logo-text { color: white; line-height: 1.1; }
                .logo-text .the { font-size: 12px; }
                .logo-text .office { font-size: 14px; font-weight: bold; }
                .logo-text .subtitle { font-size: 8px; opacity: 0.9; }
                
                .company-info { flex: 1; margin-left: 20px; }
                .company-info h1 { font-size: 28px; font-weight: 800; margin-bottom: 5px; }
                .company-info .subtitle { font-size: 14px; opacity: 0.9; }
                
                .quote-info { text-align: right; }
                .quote-number { font-size: 24px; font-weight: 800; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; }
                
                .client-section { background: #f8fafc; padding: 25px; }
                .client-header { background: #374151; color: white; padding: 12px 20px; margin: 0 -25px 20px -25px; font-weight: 600; }
                .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .client-info, .budget-info { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; }
                .client-info h3, .budget-info h3 { color: #1e293b; font-size: 14px; margin-bottom: 15px; }
                .client-info p, .budget-info p { margin: 8px 0; font-size: 13px; }
                
                .products-section { padding: 25px; }
                .section-title { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 15px 25px; margin: 0 -25px 25px -25px; font-weight: 700; }
                .products-table { width: 100%; border-collapse: collapse; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .products-table thead th { background: #374151; color: white; padding: 15px 12px; font-weight: 700; text-align: left; }
                .products-table tbody td { padding: 15px 12px; border-bottom: 1px solid #e5e7eb; }
                .products-table tbody tr:nth-child(even) { background: #f9fafb; }
                .product-row { display: flex; align-items: center; gap: 15px; }
                .product-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
                .product-desc { font-weight: 600; color: #1e293b; white-space: pre-wrap; }
                .text-center { text-align: center; }
                
                .totals-section { background: #f8fafc; padding: 25px; }
                .totals-container { max-width: 450px; margin-left: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .totals-header { background: #374151; color: white; padding: 12px 20px; font-weight: 700; }
                .totals-body { padding: 20px; }
                .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                .total-row.discount { color: #dc2626; font-weight: 600; }
                .total-row.tax { color: #ea580c; font-weight: 600; }
                .total-row.final { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; margin: 15px -20px -20px -20px; padding: 20px; font-size: 18px; font-weight: 800; }
                
                .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-content">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="logo">
                            <div class="logo-circle"></div>
                            <div class="logo-text">
                                <div class="the">the</div>
                                <div class="office">office</div>
                                <div class="subtitle">móveis para escritório</div>
                            </div>
                        </div>
                        <div class="company-info">
                            <h1>SISTEMA DE ORÇAMENTO</h1>
                            <div class="subtitle">Proposta Comercial Profissional</div>
                        </div>
                    </div>
                    <div class="quote-info">
                        <div>ORÇAMENTO</div>
                        <div class="quote-number">#${budgetInfo.number}</div>
                    </div>
                </div>
            </div>
            
            <div class="client-section">
                <div class="client-header">PROPOSTA COMERCIAL - ${clientInfo.name.toUpperCase() || 'CLIENTE'}</div>
                <div class="client-grid">
                    <div class="client-info">
                        <h3>Dados do Cliente</h3>
                        <p><strong>Nome:</strong> ${clientInfo.name || 'Não informado'}</p>
                        <p><strong>Email:</strong> ${clientInfo.email || 'Não informado'}</p>
                        <p><strong>Telefone:</strong> ${clientInfo.phone || 'Não informado'}</p>
                        <p><strong>Endereço:</strong> ${clientInfo.address || 'Não informado'}</p>
                    </div>
                    <div class="budget-info">
                        <h3>Detalhes do Orçamento</h3>
                        <p><strong>Número:</strong> ${budgetInfo.number}</p>
                        <p><strong>Data:</strong> ${formatDate(budgetInfo.date)}</p>
                        <p><strong>Válido até:</strong> ${formatDate(budgetInfo.validUntil)}</p>
                    </div>
                </div>
            </div>

            <div class="products-section">
                <div class="section-title">ITENS DO ORÇAMENTO</div>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>DESCRIÇÃO</th>
                            <th class="text-center">QUANT</th>
                            <th class="text-center">VALOR UNIT.</th>
                            <th class="text-center">VALOR TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>
                                    <div class="product-row">
                                        <img src="${product.image}" alt="Produto" class="product-image" onerror="this.style.display='none'">
                                        <div class="product-desc">${product.description || 'Produto sem descrição'}</div>
                                    </div>
                                </td>
                                <td class="text-center">${product.quantity}</td>
                                <td class="text-center">${formatCurrency(product.unitPrice)}</td>
                                <td class="text-center"><strong>${formatCurrency(product.total)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="totals-section">
                <div class="totals-container">
                    <div class="totals-header">RESUMO FINANCEIRO</div>
                    <div class="totals-body">
                        <div class="total-row">
                            <span>SUBTOTAL:</span>
                            <span>${formatCurrency(totals.subtotal)}</span>
                        </div>
                        ${budgetInfo.discount > 0 ? `
                            <div class="total-row discount">
                                <span>DESCONTO (${budgetInfo.discount}%):</span>
                                <span>- ${formatCurrency(totals.discountAmount)}</span>
                            </div>
                        ` : ''}
                        ${budgetInfo.tax > 0 ? `
                            <div class="total-row tax">
                                <span>IMPOSTOS (${budgetInfo.tax}%):</span>
                                <span>${formatCurrency(totals.taxAmount)}</span>
                            </div>
                        ` : ''}
                        <div class="total-row final">
                            <span>TOTAL</span>
                            <span>${formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>CONDIÇÕES COMERCIAIS E VALORES PARA FECHAMENTO DESTE ORÇAMENTO COMPLETO</p>
                <p>• PAGAMENTO: À VISTA OU PARCELADO CONFORME NEGOCIAÇÃO</p>
                <p>• PRAZO DE ENTREGA: CONFORME DISPONIBILIDADE</p>
                <p>• GARANTIA: CONSULTAR TERMO DO FABRICANTE</p>
                <p>• VALIDADE DESTA PROPOSTA: ${formatDate(budgetInfo.validUntil)}</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Campos do cliente
    document.getElementById('clientName').oninput = (e) => clientInfo.name = e.target.value;
    document.getElementById('clientEmail').oninput = (e) => clientInfo.email = e.target.value;
    document.getElementById('clientPhone').oninput = (e) => clientInfo.phone = e.target.value;
    document.getElementById('clientAddress').oninput = (e) => clientInfo.address = e.target.value;

    // Campos do orçamento
    document.getElementById('budgetNumber').value = budgetInfo.number;
    document.getElementById('budgetNumber').oninput = (e) => budgetInfo.number = e.target.value;
    
    document.getElementById('budgetDate').value = budgetInfo.date;
    document.getElementById('budgetDate').oninput = (e) => budgetInfo.date = e.target.value;
    
    document.getElementById('budgetValidUntil').value = budgetInfo.validUntil;
    document.getElementById('budgetValidUntil').oninput = (e) => budgetInfo.validUntil = e.target.value;
    
    document.getElementById('budgetDiscount').oninput = (e) => {
        budgetInfo.discount = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        calculateTotals();
    };
    
    document.getElementById('budgetTax').oninput = (e) => {
        budgetInfo.tax = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        calculateTotals();
    };
}

// ===== INICIALIZAÇÃO =====
function init() {
    loadCatalogFromStorage();
    setupEventListeners();
    renderProducts();
    renderCatalog();
    calculateTotals();
    console.log('✅ Sistema de Orçamento carregado com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expor funções globalmente para event handlers inline
window.openCatalog = openCatalog;
window.closeCatalog = closeCatalog;
window.addCatalogProduct = addCatalogProduct;
window.deleteCatalogProduct = deleteCatalogProduct;
window.addFromCatalog = addFromCatalog;
window.addCustomProduct = addCustomProduct;
window.updateProduct = updateProduct;
window.removeProduct = removeProduct;
window.generatePDF = generatePDF;
