
// وضعیت لاگین
const isloggin = document.body.dataset.isloggin; // "true" یا "false"

// نرمال‌سازی داده‌های سرور
function normalizeServerData(serverItems) {
    if (!Array.isArray(serverItems)) return [];
    return serverItems.map(item => ({
        id: item.productId ?? item.id,
        name: item.name ?? item.productName,
        price: Number(item.price ?? 0),
        Quantity: Number(item.Quantity ?? item.quantity ?? item.count ?? item.amount ?? 1),
        maxStock: Number(item.maxStock ?? item.stock ?? 0),
        image: item.image ?? item.imageUrl ?? ''
    }));
}

// آپدیت شمارشگر
function updateCartCount(cart) {
    if (!Array.isArray(cart)) cart = [];
    const totalCount = cart.reduce((sum, p) => sum + (Number(p.Quantity) || 1), 0);

    function tryUpdate(attempt = 1) {
        const el = document.querySelector('#cart-count') ||
            document.querySelector('#cartCount') ||
            document.querySelector('.cart-count-badge');
        if (el) {
            el.textContent = totalCount;
            console.log(`🛒 مجموع تعداد آیتم‌ها (${attempt}): ${totalCount}`);
        } else if (attempt <= 5) {
            setTimeout(() => tryUpdate(attempt + 1), 200);
        } else {
            console.warn(`⚠️ عنصر شمارشگر پیدا نشد. تعداد: ${totalCount}`);
        }
    }
    tryUpdate();
}

// رندر سبد خرید
function updateCartView(cart) {
    console.log("📢 updateCartView فراخوانی شد", cart);

    const emptyCartEl = document.querySelector('#emptyCart');
    const filledCartEl = document.querySelector('#filledCart');
    const listGroup = filledCartEl?.querySelector('.list-group');
    const totalPriceEl = document.querySelector('#totalPrice');

    if (!emptyCartEl || !filledCartEl || !listGroup || !totalPriceEl) {
        console.warn("⚠️ عناصر سبد پیدا نشد.");
        return;
    }

    if (!Array.isArray(cart) || cart.length === 0) {
        emptyCartEl.classList.remove('d-none');
        filledCartEl.classList.add('d-none');
        return;
    }

    emptyCartEl.classList.add('d-none');
    filledCartEl.classList.remove('d-none');
    listGroup.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const nameQuantitySpan = document.createElement('span');
        nameQuantitySpan.textContent = `${item.name} × ${item.Quantity}`;

        const rightDiv = document.createElement('div');
        rightDiv.className = "d-flex align-items-center";

        const priceBadge = document.createElement('span');
        priceBadge.className = "badge bg-primary rounded-pill me-2";
        priceBadge.textContent = `${(item.price * item.Quantity).toLocaleString()} تومان`;

        const removeBtn = document.createElement('button');
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.textContent = "حذف";
        removeBtn.addEventListener('click', () => removeFromCart(item.id));

        rightDiv.append(priceBadge, removeBtn);
        li.append(nameQuantitySpan, rightDiv);
        listGroup.appendChild(li);

        total += item.price * item.Quantity;
    });

    totalPriceEl.textContent = `${total.toLocaleString()} تومان`;
}

// لود سبد از سرور
function loadServerCart() {
    console.log("📥 دریافت سبد از سرور...");

    fetch('/UserPanel/UserShop/GetCart', { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error(`⛔ پاسخ نامعتبر: ${res.status}`);
            return res.json();
        })
        .then(serverData => {
            const cartArray = normalizeServerData(serverData);
            localStorage.setItem('cartItems', JSON.stringify(cartArray));
            updateCartView(cartArray);
            updateCartCount(cartArray);
            console.log("✅ سبد سرور به‌روزرسانی شد:", cartArray);
        })
        .catch(err => {
            console.error("🚨 خطا در loadServerCart:", err);
            const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
            updateCartView(localCart);
            updateCartCount(localCart);
        });
}

// حذف از سبد
function removeFromCart(productId) {
    if (isloggin === "true") {
        console.log(productId);
        fetch(`/UserPanel/UserShop/Remove?productId=${productId}`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(`⛔ خطا در حذف از سرور: ${res.status}`);
                console.log(`🗑️ محصول ${productId} از سبد سرور حذف شد`);
                loadServerCart();
            })
            .catch(err => {
                console.error("🚨 خطا در حذف آیتم (سرور):", err);
            });
    } else {
        let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartView(cart);
        updateCartCount(cart);
        console.log("❌ آیتم حذف شد (مهمان):", productId);
    }
}

// شروع کار + افزودن به سبد خرید
document.addEventListener('DOMContentLoaded', () => {



    if (isloggin === "true") {
        loadServerCart();
    } else {
        const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        updateCartView(cart);
        updateCartCount(cart);
    }

    // 🎯 رویداد دکمه افزودن به سبد خرید
    const addBtn = document.querySelector('button[data-product-id]');
    const QuantityInput = document.getElementById('quantity');

    if (addBtn && QuantityInput) {
        addBtn.addEventListener('click', () => {
            const productId = addBtn.dataset.productId;
            const Quantity = Number(QuantityInput.value || 1);
            const name = document.querySelector('h4')?.textContent.trim();
            const price = Number((document.querySelector('.price')?.textContent || '0').replace(/\D/g, ''));

            if (isloggin === "true") {
                fetch('/UserPanel/UserShop/Add', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, Quantity })
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`⛔ خطا: ${res.status}`);
                        return res.json();
                    })
                    .then(() => loadServerCart())
                    .catch(err => console.error("🚨 ارور در افزودن به سرور:", err));
            } else {
                let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
                const existing = cart.find(item => item.id == productId);
                if (existing) {
                    existing.Quantity += Quantity;
                } else {
                    cart.push({ id: productId, name, price, Quantity, maxStock: 0, image: '' });
                }
                localStorage.setItem('cartItems', JSON.stringify(cart));
                updateCartView(cart);
                updateCartCount(cart);
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const decreaseBtn = document.getElementById("decrease");
    const increaseBtn = document.getElementById("increase");
    const quantityInput = document.getElementById("quantity");

    const maxStock = parseInt(quantityInput.max, 10) || 0;
    const minStock = parseInt(quantityInput.min, 10) || 1;

    console.log("maxStock =", maxStock);

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener("click", function () {
            let currentValue = parseInt(quantityInput.value, 10) || minStock;
            if (currentValue > minStock) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseBtn.addEventListener("click", function () {
            console.log("increase click");
            let currentValue = parseInt(quantityInput.value, 10) || minStock;
            if (currentValue < maxStock) {
                quantityInput.value = currentValue + 1;
            }
        });

        // کنترل وقتی کاربر دستی تایپ کنه
        quantityInput.addEventListener("input", function () {
            let currentValue = parseInt(quantityInput.value, 10) || minStock;
            if (currentValue < minStock) {
                quantityInput.value = minStock;
            }
            if (currentValue > maxStock) {
                quantityInput.value = maxStock;
            }
        });
    } else {
        console.error("One or more elements are not found!");
    }
});
