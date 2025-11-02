// وضعیت لاگین
const IS_LOGGED_IN = document.body.dataset.isloggin === "true";

// --- ابزارهای مشترک ---
function readGuestCart() {
    return JSON.parse(localStorage.getItem('cartItems') || '[]');
}

function saveGuestCart(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function normalizeServerData(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
        id: item.productId ?? item.id,
        name: item.name ?? item.productName,
        price: Number(item.price ?? 0),
        Quantity: Number(item.Quantity ?? item.quantity ?? item.count ?? item.amount ?? 1),
        maxStock: Number(item.maxStock ?? item.stock ?? 0),
        image: item.image ?? item.imageUrl ?? ''
    }));
}

// --- آپدیت UI ---
function updateCartCount(cart) {
    if (!Array.isArray(cart)) cart = [];
    const totalCount = cart.reduce((sum, p) => sum + (Number(p.Quantity) || 1), 0);

    const tryUpdate = (attempt = 1) => {
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
    };
    tryUpdate();
}

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

    if (!cart?.length) {
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

        // 📦 نام کالا + دکمه‌های تغییر تعداد
        const leftDiv = document.createElement('div');
        leftDiv.className = "d-flex align-items-center";

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        nameSpan.classList.add("me-3");

        // 🔢 کنترل افزایش/کاهش تعداد
        const quantityControl = document.createElement('div');
        quantityControl.className = "d-flex align-items-center border rounded px-2 py-1";

        const minusBtn = document.createElement('button');
        minusBtn.className = "btn btn-sm btn-light px-2";
        minusBtn.textContent = "–";
        minusBtn.onclick = () => changeCartQuantity(item.id, item.Quantity - 1);

        const quantitySpan = document.createElement('span');
        quantitySpan.className = "mx-2 fw-bold";
        quantitySpan.textContent = item.Quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = "btn btn-sm btn-light px-2";
        plusBtn.textContent = "+";
        plusBtn.onclick = () => changeCartQuantity(item.id, item.Quantity + 1);

        quantityControl.append(minusBtn, quantitySpan, plusBtn);

        leftDiv.append(nameSpan, quantityControl);

        // 💰 قیمت و حذف
        const rightDiv = document.createElement('div');
        rightDiv.className = "d-flex align-items-center";

        const priceBadge = document.createElement('span');
        priceBadge.className = "badge bg-primary rounded-pill me-2";
        priceBadge.textContent = `${(item.price * item.Quantity).toLocaleString()} تومان`;

        const removeBtn = document.createElement('button');
        removeBtn.className = "btn btn-sm btn-danger";
        removeBtn.textContent = "حذف";
        removeBtn.onclick = () => removeFromCart(item.id);

        rightDiv.append(priceBadge, removeBtn);

        li.append(leftDiv, rightDiv);
        listGroup.appendChild(li);

        total += item.price * item.Quantity;
    });

    totalPriceEl.textContent = `${total.toLocaleString()} تومان`;
    updateCartCount(cart);
}


// --- عملیات سرور ---
function loadServerCart() {
    console.log("📥 دریافت سبد از سرور...");

    if (!IS_LOGGED_IN) {
        const localCart = readGuestCart();
        updateCartView(localCart);
        updateCartCount(localCart);
        return;
    }

    fetch('/UserPanel/UserShop/GetCart', { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error(`⛔ پاسخ نامعتبر: ${res.status}`);
            return res.json();
        })
        .then(serverData => {
            const cartArray = normalizeServerData(serverData);
            window.lastServerCart = cartArray; // ذخیره برای استفاده در addToCart
            updateCartView(cartArray);
            updateCartCount(cartArray);
            console.log("✅ سبد سرور به‌روزرسانی شد:", cartArray);
        })
        .catch(err => {
            console.error("🚨 خطا در loadServerCart:", err);
            const localCart = readGuestCart();
            updateCartView(localCart);
            updateCartCount(localCart);
        });
}

function removeFromCart(productId) {
    if (IS_LOGGED_IN) {
        fetch(`/UserPanel/UserShop/Remove?productId=${productId}`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(`⛔ خطا: ${res.status}`);
                console.log(`🗑️ محصول ${productId} از سبد سرور حذف شد`);
                loadServerCart();
            })
            .catch(err => console.error("🚨 خطا در حذف آیتم (سرور):", err));
    } else {
        const cart = readGuestCart().filter(item => item.id !== productId);
        saveGuestCart(cart);
        updateCartView(cart);
        updateCartCount(cart);
        console.log("❌ آیتم حذف شد (مهمان):", productId);
    }
}

// --- افزودن به سبد ---
function addToCart(productId, name, price, Quantity, stockValue) {
    if (IS_LOGGED_IN) {
        // گرفتن داده واقعی از DOM یا از آخرین بار loadServerCart
        const currentCartFromServer = window.lastServerCart || []; // باید بعد از loadServerCart ذخیره شود
        const existing = currentCartFromServer.find(item => item.id == productId);
        const alreadyInCart = existing ? Number(existing.Quantity) : 0;

        // موجودی نهایی از آیتم یا پارامتر ورودی
        const finalMaxStock = existing?.maxStock || stockValue || parseInt(document.getElementById('quantity')?.max, 10) || 0;
        if (!finalMaxStock || finalMaxStock <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'ثبت ناموفق',
                text: 'این محصول در حال حاضر موجود نیست .',
                //text: `شما الان ${alreadyInCart} تا دارید، موجودی کل ${finalMaxStock} است`,
                confirmButtonText: 'باشه',
                timer: 3000,
                timerProgressBar: true
            });            return;
        }
        let newTotal = alreadyInCart + Quantity;
        if (newTotal > finalMaxStock) {

            Swal.fire({
                icon: 'error',
                title: 'ثبت ناموفق',
                text:'درخواست شما بیشتر از موجودی کالا می باشد .',
                //text: `شما الان ${alreadyInCart} تا دارید، موجودی کل ${finalMaxStock} است`,
                confirmButtonText: 'باشه',
                timer: 3000,
                timerProgressBar: true
            });

       
            Quantity = Math.max(finalMaxStock - alreadyInCart, 0);
            if (Quantity <= 0) return; // چیزی برای افزودن نیست
        }

        fetch('/UserPanel/UserShop/Add', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: Number(productId), Quantity })
        })
            .then(res => {
                if (!res.ok) throw new Error(`⛔ خطا: ${res.status}`);
                return res.json();
            })
            .then(() => {
                loadServerCart();
                Swal.fire({
                    icon: 'success',
                    title: 'ثبت موفق',
                    text: 'محصول با موفقیت به سبد خرید افزوده شد.',
                    confirmButtonText: 'باشه',
                    confirmButtonColor: '#28a745', // سبز
                    timer: 2000,
                    timerProgressBar: true
                });

            })
            .catch(err => console.error("🚨 ارور در افزودن به سرور:", err));
    } else {
        let cart = readGuestCart();
        const existing = cart.find(item => item.id == productId);
        const alreadyInCart = existing ? Number(existing.Quantity) : 0;
        const newTotal = alreadyInCart + Quantity;


        if (stockValue === 0) {
            Swal.fire({
                icon: 'error',
                title: 'ناموفق',
                text: 'این کالا در حال حاضر ناموجود است.',
                confirmButtonText: 'باشه',
                timer: 3000,
                timerProgressBar: true
            });
            return;
        }

        if ( newTotal > stockValue) {
            Swal.fire({
                icon: 'error',
                title: 'ثبت ناموفق',
                text: 'درخواست شما بیشتر از موجودی کالا می باشد .',
                //text: `شما الان ${alreadyInCart} تا دارید، موجودی کل ${finalMaxStock} است`,
                confirmButtonText: 'باشه',
                timer: 3000,
                timerProgressBar: true
            });            return;
        }

        if (existing) {
            existing.Quantity = Math.min(existing.Quantity + Quantity, stockValue);
        } else {
            cart.push({ id: productId, name, price, Quantity: Math.min(Quantity, stockValue), maxStock: stockValue, image: '' });
        }
        saveGuestCart(cart);
        Swal.fire({
            icon: 'success',
            title: 'ثبت موفق',
            text: 'محصول با موفقیت به سبد خرید افزوده شد.',
            confirmButtonText: 'باشه',
            confirmButtonColor: '#28a745', // سبز
            timer: 2000,
            timerProgressBar: true
        });
        updateCartView(cart);
        updateCartCount(cart);
    }
}

// --- ادغام سبد مهمان ---
function mergeGuestCartToServer() {
    const guestCart = readGuestCart();
    if (!guestCart.length) return Promise.resolve();

    const payload = guestCart.map(item => ({
        productId: item.productId ?? item.id,
        quantity: item.Quantity ?? 1,
        price: item.price
    }));

    return fetch('/UserPanel/UserShop/MergeCart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.message || "خطا در انتقال سبد");
            localStorage.removeItem('cartItems');
            console.log("سبد مهمان منتقل شد");
        });
}

// --- رویدادها ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("position start" + IS_LOGGED_IN)
    IS_LOGGED_IN ? loadServerCart() : updateCartView(readGuestCart());

    const addBtn = document.querySelector('button[data-product-id]');
    const QuantityInput = document.getElementById('quantity');

    if (addBtn && QuantityInput) {
        addBtn.addEventListener('click', () => {
            addToCart(
                addBtn.dataset.productId,
                document.querySelector('h4')?.textContent.trim(),
                Number((document.querySelector('.price')?.textContent || '0').replace(/\D/g, '')),
                Number(QuantityInput.value || 1),
                Number(QuantityInput.max || 0)
            );
        });
    }

    const decreaseBtn = document.getElementById("decrease");
    const increaseBtn = document.getElementById("increase");

    if (decreaseBtn && increaseBtn && QuantityInput) {
        const maxStock = parseInt(QuantityInput.max, 10) || 0;
        const minStock = parseInt(QuantityInput.min, 10) || 1;

        decreaseBtn.addEventListener("click", () => {
            let val = parseInt(QuantityInput.value, 10) || minStock;
            if (val > minStock) QuantityInput.value = val - 1;
        });

        increaseBtn.addEventListener("click", () => {
            let val = parseInt(QuantityInput.value, 10) || minStock;
            if (val < maxStock) QuantityInput.value = val + 1;
        });

        QuantityInput.addEventListener("input", () => {
            let val = parseInt(QuantityInput.value, 10) || minStock;
            if (val < minStock) QuantityInput.value = minStock;
            if (val > maxStock) QuantityInput.value = maxStock;
        });
    }
});


function changeCartQuantity(productId, newQty) {
    console.log("🌀 changeCartQuantity:", { productId, newQty });

    // اگر مقدار صفر یا منفی است یعنی حذف کالا
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }

    if (IS_LOGGED_IN) {
        // 🔐 کاربر لاگین‌شده → ارسال به سرور
        fetch('/UserPanel/UserShop/UpdateQuantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId, quantity: newQty })
        })
            .then(res => {
                if (!res.ok) throw new Error(`⛔ پاسخ نامعتبر: ${res.status}`);
                return res.json();
            })
            .then(result => {
                if (result.success) {
                    console.log(`✅ تعداد ${newQty} از محصول ${productId} در سرور ثبت شد`);
                    loadServerCart();
                } else {
                    Swal.fire('خطا', result.message || 'امکان تغییر تعداد وجود ندارد', 'error');
                }
            })
            .catch(err => {
                console.error("🚨 خطا در تغییر تعداد سمت سرور:", err);
                Swal.fire('خطا', 'ارتباط با سرور برقرار نشد', 'error');
            });
    }
    else {
        // 🧺 کاربر مهمان → کنترل با stockValue
        const cart = readGuestCart();
        const item = cart.find(x => x.id == productId);
        if (!item) return;

        const stockValue = Number(item.maxStock || item.stockValue || 0);
        if (stockValue > 0 && newQty > stockValue) {
            Swal.fire({
                icon: 'error',
                title: 'ثبت ناموفق',
                text: 'درخواست شما بیشتر از موجودی کالا می‌باشد.',
                confirmButtonText: 'باشه',
                timer: 3000,
                timerProgressBar: true
            });
            // اصلاح مقدار به حداکثر مجاز
            item.Quantity = stockValue;
        } else {
            item.Quantity = newQty;
        }

        saveGuestCart(cart);
        updateCartView(cart);
        updateCartCount(cart);

        console.log(`📦 تغییر تعداد در سبد مهمان: ${item.name} → ${item.Quantity}`);
    }
}

