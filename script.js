// Cart data stored in localStorage key 'jokiMLCart'
let cart = JSON.parse(localStorage.getItem('jokiMLCart')) || [];

const cartItemsContainer = document.querySelector('.cart-items');
const totalPriceEl = document.getElementById('total-price');
const waBtn = document.getElementById('wa-btn');
const checkoutForm = document.getElementById('checkout-form');
const notification = document.createElement('div');
notification.id = 'notification';
document.body.appendChild(notification);

// Show notification popup
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// Format number to Indonesian Rupiah currency string
function formatRupiah(number) {
  return 'Rp ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Add item to cart
function addToCart(name, price, nickname, mlid, starCount = null) {
  if (!nickname || !mlid) {
    alert('Mohon isi Nickname dan ID ML terlebih dahulu.');
    return;
  }
  const item = { name, price, nickname, mlid };
  if (starCount !== null) {
    item.starCount = starCount;
  }
  cart.push(item);
  localStorage.setItem('jokiMLCart', JSON.stringify(cart));
  renderCart();
  showNotification('Produk berhasil ditambahkan ke keranjang!');
}

function renderCart() {
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Keranjang kosong.</p>';
    totalPriceEl.textContent = 'Rp 0';
    waBtn.classList.add('disabled');
    waBtn.href = '#';
    return;
  }
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    let starInfo = '';
    if (item.starCount) {
      starInfo = ` - Naik ${item.starCount} Bintang`;
    }
    let rankInfo = '';
    if (item.rank) {
      rankInfo = ` - Rank: ${item.rank.charAt(0).toUpperCase() + item.rank.slice(1)}`;
    }
    div.innerHTML = `
      <span>${item.name}${rankInfo}${starInfo}</span>
      <span>${formatRupiah(item.price)}</span>
      <span>${item.nickname}</span>
      <span>${item.mlid}</span>
      <button class="btn remove-btn" data-index="${index}">Hapus</button>
    `;
    cartItemsContainer.appendChild(div);
  });
  totalPriceEl.textContent = formatRupiah(getTotalPrice());
  waBtn.classList.remove('disabled');
  waBtn.href = '#';
}

// Calculate total price
function getTotalPrice() {
  return cart.reduce((total, item) => total + item.price, 0);
}

// Generate WhatsApp message URL for checkout
function generateWhatsAppLink(fullName, paymentMethod, mlIdServer) {
  if (cart.length === 0) return '#';
  let message = `Halo Admin, saya ingin order:\n`;
  cart.forEach((item) => {
    let starInfo = '';
    if (item.starCount) {
      starInfo = ` - Naik ${item.starCount} Bintang`;
    }
    let rankInfo = '';
    if (item.rank) {
      rankInfo = ` - Rank: ${item.rank.charAt(0).toUpperCase() + item.rank.slice(1)}`;
    }
    message += `- Layanan: ${item.name}${rankInfo}${starInfo}\n`;
    message += `- Harga: ${formatRupiah(item.price)}\n`;
    message += `- Nickname: ${item.nickname}\n`;
    message += `- ID: ${item.mlid}\n`;
  });
  message += `- Nama: ${fullName}\n`;
  message += `- ID & Server: ${mlIdServer}\n`;
  message += `- Metode Pembayaran: ${paymentMethod}\n`;
  message += `- Total: ${formatRupiah(getTotalPrice())}`;
  const phoneNumber = '6281295728972'; // Admin WA number, can be changed
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

const rankPrices = {
  warrior: 2000,
  elite: 5000,
  master: 7000,
  grandmaster: 9000,
  epic: 12000,
  legend: 15000,
  mythic: 17000,
};

document.querySelectorAll('.add-to-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const name = btn.getAttribute('data-name');
    const nickname = card.querySelector('.nickname').value.trim();
    const mlid = card.querySelector('.mlid').value.trim();
    let starCount = null;
    let rank = null;
    let rankJokiStart = null;
    let rankJokiEnd = null;
    const starSelect = card.querySelector('.star-count');
    const rankSelect = card.querySelector('.rank-select');
    const rankSelectJokiStart = card.querySelector('.rank-select-joki-start');
    const rankSelectJokiEnd = card.querySelector('.rank-select-joki-end');
    if (starSelect) {
      starCount = starSelect.value;
    }
    if (rankSelect) {
      rank = rankSelect.value;
    }
    if (rankSelectJokiStart) {
      rankJokiStart = rankSelectJokiStart.value;
    }
    if (rankSelectJokiEnd) {
      rankJokiEnd = rankSelectJokiEnd.value;
    }
    let price = 0;
    if (name === 'Joki per Rank' && rankJokiStart && rankJokiEnd) {
      // Calculate price based on difference between ranks
      const rankOrder = ['warrior', 'elite', 'master', 'grandmaster', 'epic', 'legend', 'mythic'];
      const startIndex = rankOrder.indexOf(rankJokiStart);
      const endIndex = rankOrder.indexOf(rankJokiEnd);
      if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        alert('Pilih Rank Awal dan Rank Tujuan dengan benar.');
        return;
      }
      let totalPrice = 0;
      for (let i = startIndex + 1; i <= endIndex; i++) {
        totalPrice += rankPrices[rankOrder[i]];
      }
      price = totalPrice;
    } else if (rank && starCount) {
      price = rankPrices[rank] * parseInt(starCount);
    } else {
      price = parseInt(btn.getAttribute('data-price'));
    }
    const item = { name, price, nickname, mlid };
    if (starCount !== null) {
      item.starCount = starCount;
    }
    if (rank !== null) {
      item.rank = rank;
    }
    if (rankJokiStart !== null && rankJokiEnd !== null) {
      item.rankStart = rankJokiStart;
      item.rankEnd = rankJokiEnd;
    }
    cart.push(item);
    localStorage.setItem('jokiMLCart', JSON.stringify(cart));
    renderCart();
    showNotification('Produk berhasil ditambahkan ke keranjang!');
  });
});

// Event delegation for remove buttons in cart
cartItemsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const index = e.target.getAttribute('data-index');
    cart.splice(index, 1);
    localStorage.setItem('jokiMLCart', JSON.stringify(cart));
    renderCart();
  }
});

// Checkout form submission
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fullName = checkoutForm.fullName.value.trim();
  const mlIdServer = checkoutForm.mlIdServer.value.trim();
  const paymentMethod = checkoutForm.paymentMethod.value;
  const agreement = checkoutForm.agreement.checked;

  if (!fullName || !mlIdServer || !paymentMethod || !agreement) {
    alert('Mohon lengkapi semua data dan setujui persetujuan.');
    return;
  }
  if (cart.length === 0) {
    alert('Keranjang kosong. Silakan tambahkan produk terlebih dahulu.');
    return;
  }

  const waLink = generateWhatsAppLink(fullName, paymentMethod, mlIdServer);
  window.open(waLink, '_blank');
});

function updateWaBtnHref() {
  const fullName = checkoutForm.fullName.value.trim();
  const mlIdServer = checkoutForm.mlIdServer.value.trim();
  const paymentMethod = checkoutForm.paymentMethod.value;
  if (cart.length > 0 && fullName && mlIdServer && paymentMethod) {
    waBtn.href = generateWhatsAppLink(fullName, paymentMethod, mlIdServer);
    waBtn.classList.remove('disabled');
  } else {
    waBtn.href = '#';
    waBtn.classList.add('disabled');
  }
}

// Add event listeners to checkout form inputs to update WhatsApp button href dynamically
checkoutForm.fullName.addEventListener('input', updateWaBtnHref);
checkoutForm.mlIdServer.addEventListener('input', updateWaBtnHref);
checkoutForm.paymentMethod.addEventListener('change', updateWaBtnHref);

// Update WhatsApp button href when cart changes
function renderCart() {
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Keranjang kosong.</p>';
    totalPriceEl.textContent = 'Rp 0';
    waBtn.classList.add('disabled');
    waBtn.href = '#';
    return;
  }
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    let starInfo = '';
    if (item.starCount) {
      starInfo = ` - Naik ${item.starCount} Bintang`;
    }
    let rankInfo = '';
    if (item.rank) {
      rankInfo = ` - Rank: ${item.rank.charAt(0).toUpperCase() + item.rank.slice(1)}`;
    }
    div.innerHTML = `
      <span>${item.name}${rankInfo}${starInfo}</span>
      <span>${formatRupiah(item.price)}</span>
      <span>${item.nickname}</span>
      <span>${item.mlid}</span>
      <button class="btn remove-btn" data-index="${index}">Hapus</button>
    `;
    cartItemsContainer.appendChild(div);
  });
  totalPriceEl.textContent = formatRupiah(getTotalPrice());
  updateWaBtnHref();
}

// Initial render
renderCart();
