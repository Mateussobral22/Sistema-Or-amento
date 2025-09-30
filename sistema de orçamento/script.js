/**
 * Sistema de Orçamento
 * Versão corrigida e simplificada
 */

// ===== ESTADO GLOBAL =====
let products = [];
let clientInfo = {
    name: '',
    email: '',
    phone: '',
    address: ''
};
let companyInfo = {
    name: 'SISTEMA DE ORÇAMENTO',
    subtitle: 'Proposta Comercial Profissional',
    phone: '',
    cnpj: '',
    address: ''
};
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
    if (isNaN(value)) value = 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

// ===== FUNÇÕES DE PRODUTOS =====
function addProduct() {
    const newProduct = {
        id: Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
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
    }
    
    renderProducts();
    calculateTotals();
}

function removeProduct(id) {
    if (confirm('Tem certeza que deseja remover este item?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
        calculateTotals();
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Nenhum produto adicionado. Clique em "Adicionar Item" para começar.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <textarea class="form-control" 
                         placeholder="Descrição do produto/serviço"
                         rows="2"
                         style="resize: vertical; min-height: 50px;"
                         onchange="updateProduct(${product.id}, 'description', this.value)">${product.description}</textarea>
            </td>
            <td class="text-center">
                <input type="number" 
                       class="form-control" 
                       min="1" 
                       value="${product.quantity}"
                       style="width: 80px;"
                       onchange="updateProduct(${product.id}, 'quantity', this.value)">
            </td>
            <td class="text-center">
                <input type="number" 
                       class="form-control" 
                       min="0" 
                       step="0.01"
                       value="${product.unitPrice}"
                       style="width: 100px;"
                       onchange="updateProduct(${product.id}, 'unitPrice', this.value)">
            </td>
            <td class="text-right" style="font-weight: 600;">
                ${formatCurrency(product.total)}
            </td>
            <td class="text-center">
                <button class="btn btn-icon" onclick="removeProduct(${product.id})">
                    <svg class="small-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== CÁLCULOS =====
function calculateTotals() {
    const subtotal = products.reduce((sum, product) => sum + product.total, 0);
    const discountAmount = (subtotal * budgetInfo.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * budgetInfo.tax) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    updateTotalsDisplay({
        subtotal,
        discountAmount,
        subtotalAfterDiscount,
        taxAmount,
        total
    });

    return { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total };
}

function updateTotalsDisplay(totals) {
    const subtotalEl = document.getElementById('subtotal');
    const discountRow = document.getElementById('discountRow');
    const discountLabel = document.getElementById('discountLabel');
    const discountAmount = document.getElementById('discountAmount');
    const subtotalAfterDiscountRow = document.getElementById('subtotalAfterDiscountRow');
    const subtotalAfterDiscount = document.getElementById('subtotalAfterDiscount');
    const taxRow = document.getElementById('taxRow');
    const taxLabel = document.getElementById('taxLabel');
    const taxAmount = document.getElementById('taxAmount');
    const totalAmount = document.getElementById('totalAmount');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
    
    if (budgetInfo.discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (subtotalAfterDiscountRow) subtotalAfterDiscountRow.style.display = 'flex';
        if (discountLabel) discountLabel.textContent = `Desconto (${budgetInfo.discount}%):`;
        if (discountAmount) discountAmount.textContent = `- ${formatCurrency(totals.discountAmount)}`;
        if (subtotalAfterDiscount) subtotalAfterDiscount.textContent = formatCurrency(totals.subtotalAfterDiscount);
    } else {
        if (discountRow) discountRow.style.display = 'none';
        if (subtotalAfterDiscountRow) subtotalAfterDiscountRow.style.display = 'none';
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
                
                .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 25px; position: relative; }
                .header-content { display: flex; justify-content: space-between; align-items: center; }
                
                /* Logo The Office */
                .company-logo {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                
                .logo-container {
                    position: relative;
                    width: 80px;
                    height: 50px;
                    background: #000;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                }
                
                .logo-circle {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 20px;
                    height: 20px;
                    background: #c2754f;
                    border-radius: 50%;
                }
                
                .logo-text {
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 11px;
                    font-weight: normal;
                    line-height: 1.1;
                    text-align: left;
                }
                
                .logo-text .the { font-size: 12px; }
                .logo-text .office { font-size: 14px; font-weight: bold; }
                .logo-text .subtitle { font-size: 8px; opacity: 0.9; margin-top: 2px; }
                
                .company-info {
                    flex: 1;
                    margin-left: 20px;
                }
                
                .company-info h1 { 
                    font-size: 28px; 
                    font-weight: 800; 
                    margin-bottom: 5px; 
                    color: white;
                }
                .company-info .subtitle { 
                    font-size: 14px; 
                    opacity: 0.9; 
                }
                
                .quote-info { text-align: right; }
                .quote-number { 
                    font-size: 24px; 
                    font-weight: 800; 
                    background: rgba(255,255,255,0.2); 
                    padding: 8px 16px; 
                    border-radius: 8px; 
                }
                
                .client-section { background: #f8fafc; padding: 25px; }
                .client-header { 
                    background: #374151; 
                    color: white; 
                    padding: 12px 20px; 
                    margin: 0 -25px 20px -25px; 
                    font-weight: 600; 
                }
                .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .client-info, .budget-info { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 12px; 
                    border-left: 4px solid #3b82f6; 
                }
                .client-info h3, .budget-info h3 { 
                    color: #1e293b; 
                    font-size: 14px; 
                    margin-bottom: 15px; 
                }
                .client-info p, .budget-info p { 
                    margin: 8px 0; 
                    font-size: 13px; 
                }
                
                .products-section { padding: 25px; }
                .section-title { 
                    background: linear-gradient(135deg, #1e3a8a, #3b82f6); 
                    color: white; 
                    padding: 15px 25px; 
                    margin: 0 -25px 25px -25px; 
                    font-weight: 700; 
                }
                .products-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
                }
                .products-table thead th { 
                    background: #374151; 
                    color: white; 
                    padding: 15px 12px; 
                    font-weight: 700; 
                    text-align: center; 
                }
                .products-table thead th:first-child { 
                    text-align: left; 
                    width: 50%; 
                }
                .products-table tbody td { 
                    padding: 15px 12px; 
                    border-bottom: 1px solid #e5e7eb; 
                }
                .products-table tbody tr:nth-child(even) { 
                    background: #f9fafb; 
                }
                .product-desc { 
                    font-weight: 600; 
                    color: #1e293b; 
                    white-space: pre-wrap;
                }
                .product-qty, .product-unit, .product-total { 
                    text-align: center; 
                    font-weight: 500; 
                }
                
                .totals-section { background: #f8fafc; padding: 25px; }
                .totals-container { 
                    max-width: 450px; 
                    margin-left: auto; 
                    background: white; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
                }
                .totals-header { 
                    background: #374151; 
                    color: white; 
                    padding: 12px 20px; 
                    font-weight: 700; 
                }
                .totals-body { padding: 20px; }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 10px 0; 
                    border-bottom: 1px solid #f1f5f9; 
                }
                .total-row.discount { color: #dc2626; font-weight: 600; }
                .total-row.tax { color: #ea580c; font-weight: 600; }
                .total-row.final { 
                    background: linear-gradient(135deg, #1e3a8a, #3b82f6); 
                    color: white; 
                    margin: 15px -20px -20px -20px; 
                    padding: 20px; 
                    font-size: 18px; 
                    font-weight: 800; 
                }
                
                .footer { 
                    background: #374151; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 11px; 
                }
                
                .company-details {
                    background: #000;
                    color: white;
                    padding: 15px 25px;
                    font-size: 11px;
                }
                
                .company-details-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .company-contact p {
                    margin: 2px 0;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-content">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="logo-container">
                            <div class="logo-circle"></div>
                            <div class="logo-text">
                                <div class="the">the</div>
                                <div class="office">office</div>
                                <div class="subtitle">móveis para escritório</div>
                            </div>
                        </div>
                        <div class="company-info">
                            <h1>${companyInfo.name}</h1>
                            <div class="subtitle">${companyInfo.subtitle}</div>
                        </div>
                    </div>
                    <div class="quote-info">
                        <div>ORÇAMENTO</div>
                        <div class="quote-number">#${budgetInfo.number}</div>
                    </div>
                </div>
            </div>
            
            ${companyInfo.phone || companyInfo.cnpj || companyInfo.address ? `
                <div class="company-details">
                    <div class="company-details-grid">
                        <div class="company-contact">
                            ${companyInfo.phone ? `<p><strong>TEL:</strong> ${companyInfo.phone}</p>` : ''}
                            ${companyInfo.cnpj ? `<p><strong>CNPJ:</strong> ${companyInfo.cnpj}</p>` : ''}
                        </div>
                        <div class="company-contact">
                            ${companyInfo.address ? `<p><strong>Endereço:</strong> ${companyInfo.address}</p>` : ''}
                        </div>
                        <div class="company-contact">
                            <p><strong>DATA:</strong> ${formatDate(budgetInfo.date)}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
            
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
                        <p><strong>Consultor:</strong> Sistema Automatizado</p>
                    </div>
                </div>
            </div>

            <div class="products-section">
                <div class="section-title">ITENS DO ORÇAMENTO</div>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>DESCRIÇÃO</th>
                            <th>QUANT</th>
                            <th>VALOR UNIT.</th>
                            <th>VALOR TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td class="product-desc">${product.description || 'Produto sem descrição'}</td>
                                <td class="product-qty">${product.quantity}</td>
                                <td class="product-unit">${formatCurrency(product.unitPrice)}</td>
                                <td class="product-total">${formatCurrency(product.total)}</td>
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
    // Botão adicionar produto
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.onclick = addProduct;
    }

    // Botão download PDF
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = generatePDF;
    }

    // Campos da empresa
    const companyName = document.getElementById('companyName');
    if (companyName) {
        companyName.oninput = (e) => companyInfo.name = e.target.value;
        companyName.value = companyInfo.name;
    }

    const companySubtitle = document.getElementById('companySubtitle');
    if (companySubtitle) {
        companySubtitle.oninput = (e) => companyInfo.subtitle = e.target.value;
        companySubtitle.value = companyInfo.subtitle;
    }

    const companyPhone = document.getElementById('companyPhone');
    if (companyPhone) {
        companyPhone.oninput = (e) => companyInfo.phone = e.target.value;
    }

    const companyCNPJ = document.getElementById('companyCNPJ');
    if (companyCNPJ) {
        companyCNPJ.oninput = (e) => companyInfo.cnpj = e.target.value;
    }

    const companyAddress = document.getElementById('companyAddress');
    if (companyAddress) {
        companyAddress.oninput = (e) => companyInfo.address = e.target.value;
    }

    // Campos do cliente
    const clientName = document.getElementById('clientName');
    if (clientName) {
        clientName.oninput = (e) => clientInfo.name = e.target.value;
    }

    const clientEmail = document.getElementById('clientEmail');
    if (clientEmail) {
        clientEmail.oninput = (e) => clientInfo.email = e.target.value;
    }

    const clientPhone = document.getElementById('clientPhone');
    if (clientPhone) {
        clientPhone.oninput = (e) => clientInfo.phone = e.target.value;
    }

    const clientAddress = document.getElementById('clientAddress');
    if (clientAddress) {
        clientAddress.oninput = (e) => clientInfo.address = e.target.value;
    }

    // Campos do orçamento
    const budgetNumber = document.getElementById('budgetNumber');
    if (budgetNumber) {
        budgetNumber.oninput = (e) => budgetInfo.number = e.target.value;
        budgetNumber.value = budgetInfo.number;
    }

    const budgetDate = document.getElementById('budgetDate');
    if (budgetDate) {
        budgetDate.oninput = (e) => budgetInfo.date = e.target.value;
        budgetDate.value = budgetInfo.date;
    }

    const budgetValidUntil = document.getElementById('budgetValidUntil');
    if (budgetValidUntil) {
        budgetValidUntil.oninput = (e) => budgetInfo.validUntil = e.target.value;
        budgetValidUntil.value = budgetInfo.validUntil;
    }

    const budgetDiscount = document.getElementById('budgetDiscount');
    if (budgetDiscount) {
        budgetDiscount.oninput = (e) => {
            budgetInfo.discount = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
            calculateTotals();
        };
        budgetDiscount.value = budgetInfo.discount;
    }

    const budgetTax = document.getElementById('budgetTax');
    if (budgetTax) {
        budgetTax.oninput = (e) => {
            budgetInfo.tax = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
            calculateTotals();
        };
        budgetTax.value = budgetInfo.tax;
    }
}

// ===== INICIALIZAÇÃO =====
function init() {
    setupEventListeners();
    renderProducts();
    calculateTotals();
    console.log('Sistema de Orçamento carregado com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expor funções globalmente para os event handlers inline
window.updateProduct = updateProduct;
window.removeProduct = removeProduct;