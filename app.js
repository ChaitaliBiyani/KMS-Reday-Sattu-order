// Product Catalog Data matching sheet headers & prices exactly
const catalog = {
  "ready": [
    {
      id: "ready_kolkata_daliya",
      name: "Kolkata Daliya",
      category: "READY ATTA SATTU",
      options: [
        { label: "1/4 kg", price: 190 },
        { label: "1/2 kg", price: 375 },
        { label: "1 kg", price: 750 },
        { label: "1.250 kg", price: 940 }
      ]
    },
    {
      id: "ready_mumbai_daliya",
      name: "Mumbai Daliya",
      category: "READY ATTA SATTU",
      options: [
        { label: "1/4 kg", price: 190 },
        { label: "1/2 kg", price: 375 },
        { label: "1 kg", price: 750 },
        { label: "1.250 kg", price: 940 }
      ]
    },
    {
      id: "ready_gehu",
      name: "Gehu",
      category: "READY ATTA SATTU",
      options: [
        { label: "1/4 kg", price: 175 },
        { label: "1/2 kg", price: 350 },
        { label: "1 kg", price: 700 },
        { label: "1.250 kg", price: 875 }
      ]
    },
    {
      id: "ready_rice",
      name: "Rice",
      category: "READY ATTA SATTU",
      options: [
        { label: "1/4 kg", price: 175 },
        { label: "1/2 kg", price: 350 },
        { label: "1 kg", price: 700 },
        { label: "1.250 kg", price: 875 }
      ]
    }
  ],
  "sika": [
    {
      id: "sika_besan",
      name: "Besan",
      category: "SIKA HUA SATTU",
      options: [
        { label: "1/4 kg", price: 190 },
        { label: "1/2 kg", price: 375 },
        { label: "1 kg", price: 750 },
        { label: "1.250 kg", price: 940 }
      ]
    },
    {
      id: "sika_gehu",
      name: "Gehu",
      category: "SIKA HUA SATTU",
      options: [
        { label: "1/4 kg", price: 175 },
        { label: "1/2 kg", price: 350 },
        { label: "1 kg", price: 700 },
        { label: "1.250 kg", price: 875 }
      ]
    },
    {
      id: "sika_rice",
      name: "Rice",
      category: "SIKA HUA SATTU",
      options: [
        { label: "1/4 kg", price: 175 },
        { label: "1/2 kg", price: 350 },
        { label: "1 kg", price: 700 },
        { label: "1.250 kg", price: 875 }
      ]
    }
  ]
};

// Application State
let cart = {}; // maps key `productId|sizeLabel` to qty
let orderHistory = [];
let currentGeneratedHTML = "";
let activeOrderId = "";
let isAdminLoggedIn = false;

// Khetra payment QR codes map
const khetraQRCodes = {
  "Ghatkopar": "qrcodes/ghatkopar.svg",
  "Goregaon": "qrcodes/goregaon.svg",
  "Boriwali": "qrcodes/boriwali.svg",
  "Andheri": "qrcodes/andheri.svg",
  "mulund": "qrcodes/mulund.svg",
  "Dakshin Mumbai": "qrcodes/dakshin_mumbai.svg",
  "Madhya mumbai": "qrcodes/madhya_mumbai.svg",
  "Malad": "qrcodes/malad.svg"
};

// Update QR Code display based on selected Khetra
function updateKhetraQR(khetraValue) {
  const qrImage = document.getElementById("khetra-qr-image");
  const qrTitle = document.getElementById("khetra-qr-title");
  const qrText = document.getElementById("khetra-qr-text");
  
  if (khetraQRCodes[khetraValue]) {
    if (qrImage) qrImage.src = khetraQRCodes[khetraValue];
    if (qrTitle) qrTitle.innerText = `${khetraValue} Payment QR`;
    if (qrText) qrText.innerHTML = `Scan this QR code to make payment for the <strong>${khetraValue}</strong> branch.`;
  }
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Load order history from localStorage if exists
  const savedHistory = localStorage.getItem("order_history_teej");
  if (savedHistory) {
    orderHistory = JSON.parse(savedHistory);
    updateHistoryTable();
  }

  renderCatalog();

  // Initialize Khetra QR code mapping and change listener
  const khetraSelect = document.getElementById("khetra");
  if (khetraSelect) {
    khetraSelect.addEventListener("change", (e) => {
      updateKhetraQR(e.target.value);
    });
    // Set initial QR code based on default selected value
    updateKhetraQR(khetraSelect.value);
  }
});

// Render Catalog Cards
function renderCatalog() {
  const readyGrid = document.getElementById("ready-grid");
  const sikaGrid = document.getElementById("sika-grid");

  readyGrid.innerHTML = "";
  sikaGrid.innerHTML = "";

  // Render Ready Atta Sattu Products
  catalog.ready.forEach(prod => {
    readyGrid.appendChild(createProductCard(prod));
  });

  // Render Sika Hua Sattu Products
  catalog.sika.forEach(prod => {
    sikaGrid.appendChild(createProductCard(prod));
  });
}

// Helper to create product card
function createProductCard(prod) {
  const card = document.createElement("div");
  card.className = "product-card";

  let optionsHTML = "";
  const isReady = prod.category === 'READY ATTA SATTU';
  prod.options.forEach((opt, idx) => {
    const inputId = `${prod.id}_${opt.label.replace(/\s+/g, '')}`;
    const isLast = idx === prod.options.length - 1;
    optionsHTML += `
      <div class="size-row-container" style="${isLast ? '' : 'border-bottom: 1px solid #f3f4f6;'}">
        <div class="size-row" style="border-bottom: none;">
          <div class="size-info">
            <span class="size-label">${opt.label}</span>
            <span class="size-price">₹${opt.price}</span>
          </div>
          <div class="qty-counter ${isReady ? 'counter-ready' : 'counter-sika'}">
            <button class="qty-btn" type="button" onclick="updateQty('${prod.id}', '${opt.label}', -1)">-</button>
            <input type="number" class="qty-input" id="${inputId}" value="0" min="0" onchange="setQty('${prod.id}', '${opt.label}', this.value)">
            <button class="qty-btn" type="button" onclick="updateQty('${prod.id}', '${opt.label}', 1)">+</button>
          </div>
        </div>
        ${opt.label.trim() === "1/4 kg" ? `<div class="qty-warning" id="warning_${inputId}" style="display: none; color: #ef4444; font-size: 0.8rem; text-align: right; padding-bottom: 8px; font-weight: 500; margin-top: -4px;">⚠️ Min 20 packs (5 kg) required</div>` : ''}
      </div>
    `;
  });

  card.innerHTML = `
    <div class="product-header">
      <h3 class="product-name">${prod.name}</h3>
      <span class="product-category-tag ${isReady ? 'tag-ready' : 'tag-sika'}">${prod.category.split(' ')[0]}</span>
    </div>
    <div class="size-option-list">
      ${optionsHTML}
    </div>
  `;

  return card;
}

// Switch Tabs
function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".products-panel").forEach(panel => panel.classList.remove("active"));

  if (tab === 'ready') {
    document.querySelector(".tab-btn:nth-child(1)").classList.add("active");
    document.getElementById("ready-panel").classList.add("active");
  } else {
    document.querySelector(".tab-btn:nth-child(2)").classList.add("active");
    document.getElementById("sika-panel").classList.add("active");
  }
}

// Change Quantity (+/- buttons)
function updateQty(prodId, label, delta) {
  const key = `${prodId}|${label}`;
  const currentVal = cart[key] || 0;
  const newVal = Math.max(0, currentVal + delta);
  
  cart[key] = newVal;
  updateUI(prodId, label, newVal);
  calculateTotals();
}

// Set Quantity (direct input)
function setQty(prodId, label, value) {
  const key = `${prodId}|${label}`;
  const newVal = Math.max(0, parseInt(value) || 0);
  
  cart[key] = newVal;
  updateUI(prodId, label, newVal);
  calculateTotals();
}

// Update input value in UI
function updateUI(prodId, label, value) {
  const inputId = `${prodId}_${label.replace(/\s+/g, '')}`;
  const input = document.getElementById(inputId);
  if (input) {
    input.value = value;
    
    // Check validation warning for 1/4 kg size
    const warning = document.getElementById(`warning_${inputId}`);
    const counter = input.closest(".qty-counter");
    const numVal = parseInt(value) || 0;
    
    if (label.trim() === "1/4 kg") {
      if (numVal > 0 && numVal < 20) {
        if (counter) {
          counter.style.background = "#fee2e2";
          counter.style.border = "1px solid #ef4444";
        }
        if (warning) warning.style.display = "block";
      } else {
        if (counter) {
          counter.style.background = "";
          counter.style.border = "";
        }
        if (warning) warning.style.display = "none";
      }
    }
  }
}

// Recalculate and update Sidebar
function calculateTotals() {
  const container = document.getElementById("summary-items-container");
  container.innerHTML = "";

  let totalQty = 0;
  let grandTotal = 0;
  let hasItems = false;

  // Scan through all items in cart
  Object.keys(cart).forEach(key => {
    const qty = cart[key];
    if (qty > 0) {
      hasItems = true;
      const [prodId, label] = key.split('|');
      
      // Find item details
      let item = null;
      let category = "";
      // Check ready Sattu
      let prod = catalog.ready.find(p => p.id === prodId);
      if (prod) {
        item = prod;
        category = "READY ATTA SATTU";
      } else {
        prod = catalog.sika.find(p => p.id === prodId);
        if (prod) {
          item = prod;
          category = "SIKA HUA SATTU";
        }
      }

      if (item) {
        const opt = item.options.find(o => o.label === label);
        if (opt) {
          const subtotal = qty * opt.price;
          totalQty += qty;
          grandTotal += subtotal;

          // Render summary row
          const row = document.createElement("div");
          row.className = "summary-item-row";
          row.innerHTML = `
            <div class="summary-item-details">
              <span class="summary-item-name">${item.name} (${label})</span>
              <span class="summary-item-sub">${category} | Qty: ${qty}</span>
            </div>
            <span class="summary-item-cost">₹${subtotal.toFixed(2)}</span>
          `;
          container.appendChild(row);
        }
      }
    }
  });

  if (!hasItems) {
    container.innerHTML = `<p style="color: var(--text-light); text-align: center; margin-top: 20px;">No items selected yet.</p>`;
  }

  document.getElementById("total-qty").innerText = totalQty;
  document.getElementById("grand-total").innerText = `₹${grandTotal.toFixed(2)}`;
}

// Toggle UPI payment screenshot group
function togglePaymentScreenshot() {
  const method = document.getElementById("payment-method").value;
  const screenshotGroup = document.getElementById("screenshot-group");
  if (screenshotGroup) {
    if (method === "UPI / Scan QR") {
      screenshotGroup.style.display = "block";
    } else {
      screenshotGroup.style.display = "none";
      const fileInput = document.getElementById("payment-screenshot");
      if (fileInput) fileInput.value = "";
    }
  }
}

// Admin passcode lock control
function toggleAdminAccess() {
  const adminToggleBtn = document.getElementById("admin-toggle-btn");
  const adminHistorySection = document.getElementById("admin-history-section");
  
  if (isAdminLoggedIn) {
    // Log out
    isAdminLoggedIn = false;
    if (adminHistorySection) adminHistorySection.style.display = "none";
    if (adminToggleBtn) adminToggleBtn.innerText = "View Order History (Admin)";
    alert("Admin logged out.");
  } else {
    const pass = prompt("Enter Admin Passcode:");
    if (pass === "admin123") {
      isAdminLoggedIn = true;
      if (adminHistorySection) adminHistorySection.style.display = "block";
      if (adminToggleBtn) adminToggleBtn.innerText = "Close Admin Portal";
      updateHistoryTable();
      alert("Admin Access Granted!");
    } else if (pass !== null) {
      alert("Incorrect passcode!");
    }
  }
}

// Submit the Order (replaces generateBill)
function submitOrder() {
  const khetra = document.getElementById("khetra").value;
  const custName = document.getElementById("customer-name").value.trim();
  const custMobile = document.getElementById("customer-mobile").value.trim();
  const paymentMethod = document.getElementById("payment-method").value;
  const fileInput = document.getElementById("payment-screenshot");

  if (!custName) {
    alert("Please enter Customer Name.");
    return;
  }
  if (!custMobile) {
    alert("Please enter Mobile Number.");
    return;
  }

  // Validate minimum order requirement for 1/4 kg size (min 20 packs / 5 kg)
  let validationErrors = [];
  Object.keys(cart).forEach(key => {
    const qty = cart[key];
    if (qty > 0) {
      const [prodId, label] = key.split('|');
      if (label.trim() === "1/4 kg" && qty < 20) {
        let prod = catalog.ready.find(p => p.id === prodId) || catalog.sika.find(p => p.id === prodId);
        const prodName = prod ? prod.name : prodId;
        const categoryName = prod ? prod.category : "";
        validationErrors.push(`For ${prodName} (${categoryName}), the 1/4 kg size requires a minimum order of 20 packs (5 kg). Currently selected: ${qty} pack(s).`);
      }
    }
  });

  if (validationErrors.length > 0) {
    alert(validationErrors.join("\n\n"));
    return;
  }

  // Count active items and totals
  let activeItems = [];
  let grandTotal = 0;
  let totalQty = 0;

  Object.keys(cart).forEach(key => {
    const qty = cart[key];
    if (qty > 0) {
      const [prodId, label] = key.split('|');
      
      let item = null;
      let category = "";
      let prod = catalog.ready.find(p => p.id === prodId);
      if (prod) {
        item = prod;
        category = "READY ATTA SATTU";
      } else {
        prod = catalog.sika.find(p => p.id === prodId);
        if (prod) {
          item = prod;
          category = "SIKA HUA SATTU";
        }
      }

      if (item) {
        const opt = item.options.find(o => o.label === label);
        if (opt) {
          const subtotal = qty * opt.price;
          totalQty += qty;
          grandTotal += subtotal;
          activeItems.push({
            category: category,
            productName: item.name,
            measure: label,
            quantity: qty,
            price: opt.price,
            amount: subtotal
          });
        }
      }
    }
  });

  if (activeItems.length === 0) {
    alert("Please add at least one product with quantity greater than 0.");
    return;
  }

  // Validate UPI payment screenshot
  if (paymentMethod === "UPI / Scan QR" && (!fileInput.files || !fileInput.files[0])) {
    alert("Please attach a payment screenshot for UPI/QR Code payments.");
    return;
  }

  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  // If there is a file, read it as base64
  if (paymentMethod === "UPI / Scan QR" && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result;
      processSubmitOrder(orderId, khetra, custName, custMobile, paymentMethod, base64Data, activeItems, totalQty, grandTotal);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    processSubmitOrder(orderId, khetra, custName, custMobile, paymentMethod, null, activeItems, totalQty, grandTotal);
  }
}

// Process the order saving
function processSubmitOrder(orderId, khetra, custName, custMobile, paymentMethod, screenshotBase64, activeItems, totalQty, grandTotal) {
  let tbodyHTML = "";
  activeItems.forEach(item => {
    let displayName = `${item.productName} (${item.category})`;
    tbodyHTML += `
          <tr>
            <td>${displayName}</td>
            <td>${item.measure}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.amount.toFixed(2)}</td>
          </tr>`;
  });

  const billHTML = `
    <div class="bill-container">
      <h2 class="bill-title">Order Receipt</h2>
      <p class="bill-details">
        <strong>Order ID:</strong> ${orderId}<br>
        <strong>Name:</strong> ${custName}<br>
        <strong>Mobile:</strong> ${custMobile}<br>
        <strong>Khetra:</strong> ${khetra}<br>
        <strong>Payment Method:</strong> ${paymentMethod}
      </p>
      <table class="bill-table" border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>Product</th>
            <th>Measure</th>
            <th>Quantity</th>
            <th>Unit Price (₹)</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${tbodyHTML}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right;"><strong>Total</strong></td>
            <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const newOrder = {
    id: orderId,
    khetra: khetra,
    customer: custName,
    mobile: custMobile,
    paymentMethod: paymentMethod,
    screenshot: screenshotBase64,
    qty: totalQty,
    total: grandTotal,
    items: activeItems,
    html: billHTML,
    timestamp: new Date().toLocaleString()
  };

  orderHistory.unshift(newOrder);
  localStorage.setItem("order_history_teej", JSON.stringify(orderHistory));
  
  if (isAdminLoggedIn) {
    updateHistoryTable();
  }

  // Show receipt modal
  activeOrderId = orderId;
  currentGeneratedHTML = billHTML;
  document.getElementById("modal-bill-body").innerHTML = billHTML;
  document.getElementById("bill-modal").style.display = "flex";

  // Reset form inputs (without using resetForm which prompts confirm)
  cart = {};
  document.querySelectorAll(".qty-input").forEach(input => {
    input.value = 0;
    const counter = input.closest(".qty-counter");
    if (counter) {
      counter.style.background = "";
      counter.style.border = "";
    }
  });
  document.querySelectorAll(".qty-warning").forEach(warning => warning.style.display = "none");
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-mobile").value = "";
  document.getElementById("payment-method").value = "Cash on Delivery";
  togglePaymentScreenshot();
  calculateTotals();

  alert("Order Submitted Successfully!");
}

// Close Modal
function closeModal() {
  document.getElementById("bill-modal").style.display = "none";
}

// Print Bill
function printBill() {
  window.print();
}

// Reset entire form
function resetForm() {
  if (confirm("Are you sure you want to clear current order quantities?")) {
    cart = {};
    document.querySelectorAll(".qty-input").forEach(input => input.value = 0);
    document.getElementById("customer-name").value = "";
    document.getElementById("customer-mobile").value = "";
    calculateTotals();
  }
}

// Update Dashboard History Table
function updateHistoryTable() {
  const tbody = document.getElementById("history-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (orderHistory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: var(--text-light);">No orders placed in this session.</td>
      </tr>
    `;
    return;
  }

  orderHistory.forEach(order => {
    const row = document.createElement("tr");
    
    // Screenshot cell
    let screenshotHTML = "-";
    if (order.screenshot) {
      screenshotHTML = `<a href="${order.screenshot}" target="_blank"><img src="${order.screenshot}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; display: block; margin: 0 auto; cursor: pointer;" alt="Receipt"></a>`;
    }
    
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.khetra || order.taker || ""}</td>
      <td>${order.customer}</td>
      <td>${order.mobile}</td>
      <td>${order.paymentMethod || "Cash on Delivery"}</td>
      <td style="text-align: center;">${screenshotHTML}</td>
      <td>${order.qty} packs</td>
      <td>₹${order.total.toFixed(2)}</td>
      <td class="action-links">
        <span class="action-link" onclick="viewHistoryOrder('${order.id}')">View Detail</span>
        <span class="action-link" style="color: #ef4444;" onclick="deleteHistoryOrder('${order.id}')">Delete</span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// View bill of a past logged order
function viewHistoryOrder(orderId) {
  const order = orderHistory.find(o => o.id === orderId);
  if (order) {
    activeOrderId = orderId;
    currentGeneratedHTML = order.html;
    document.getElementById("modal-bill-body").innerHTML = order.html;
    document.getElementById("bill-modal").style.display = "flex";
  }
}

// Delete order from local session history
function deleteHistoryOrder(orderId) {
  if (confirm("Delete this order from history?")) {
    orderHistory = orderHistory.filter(o => o.id !== orderId);
    localStorage.setItem("order_history_teej", JSON.stringify(orderHistory));
    updateHistoryTable();
  }
}

// Export History to CSV format
function exportHistoryCSV() {
  if (orderHistory.length === 0) {
    alert("No order history to export.");
    return;
  }

  // Headers: Timestamp, Person Taking Order, Customer Name, Mobile Number, Product1_Size1, Product1_Size2...
  let productHeaders = [];
  
  // Ready Atta Sattu
  catalog.ready.forEach(prod => {
    prod.options.forEach(opt => {
      productHeaders.push(`${prod.category} - ${prod.name} (${opt.label})`);
    });
  });
  // Sika Hua Sattu
  catalog.sika.forEach(prod => {
    prod.options.forEach(opt => {
      productHeaders.push(`${prod.category} - ${prod.name} (${opt.label})`);
    });
  });

  let csvRows = [];
  
  // Header row
  let headerRow = ["Timestamp", "Khetra", "Customer Name", "Mobile Number", "Payment Method", "Screenshot Attached"].concat(productHeaders).concat(["Total Packs", "Total Cost"]);
  csvRows.push(headerRow.map(h => `"${h}"`).join(","));

  // Data rows
  orderHistory.forEach(order => {
    let rowData = [
      order.timestamp,
      order.khetra || order.taker || "",
      order.customer,
      order.mobile,
      order.paymentMethod || "Cash on Delivery",
      order.screenshot ? "Yes" : "No"
    ];

    // For each product header, check quantity in order items
    productHeaders.forEach(header => {
      const foundItem = order.items.find(item => {
        const itemHeader = `${item.category} - ${item.productName} (${item.measure})`;
        return itemHeader === header;
      });
      rowData.push(foundItem ? foundItem.quantity : 0);
    });

    rowData.push(order.qty);
    rowData.push(order.total.toFixed(2));

    csvRows.push(rowData.map(r => `"${r}"`).join(","));
  });

  // Download trigger
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Teej_Order_Responses_" + new Date().toISOString().slice(0,10) + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
