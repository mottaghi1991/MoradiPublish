function setupPhoneForm() {
    const phoneForm = document.getElementById('phoneForm');
    phoneForm.addEventListener('submit', handlePhoneSubmit);
}

function setupCodeForm() {
    const codeForm = document.getElementById('codeForm');
    codeForm.addEventListener('submit', handleCodeSubmit);
}

function handlePhoneSubmit(event) {
    event.preventDefault();

    const phoneInput = document.getElementById('UserName');
    const phoneError = document.getElementById('phoneError');
    const phoneValue = phoneInput.value.trim();
    const regex = /^09\d{9}$/;

    if (!regex.test(phoneValue)) {
        phoneError.style.display = 'block';
        return;
    }

    phoneError.style.display = 'none';

    sendVerificationCode(phoneValue);
}

function sendVerificationCode(phoneValue) {
    fetch('/SendCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PhoneNumber: phoneValue })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                return Swal.fire({ title: "خطا!", text: data.message, icon: "error", confirmButtonText: "باشه" });
            }

            Swal.fire({ title: "موفق!", text: data.message, icon: "success", confirmButtonText: "باشه" });

            toggleForms(true);
            startTimer(120); // 2 دقیقه
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ title: "خطا!", text: "خطا در ارتباط با سرور", icon: "error", confirmButtonText: "باشه" });
        });
}
function ResendVerificationCode() {
    fetch('/ReSendCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                return Swal.fire({ title: "خطا!", text: data.message, icon: "error", confirmButtonText: "باشه" });
            }

            Swal.fire({ title: "موفق!", text: data.message, icon: "success", confirmButtonText: "باشه" });

            toggleForms(true);
            startTimer(120); // 2 دقیقه
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ title: "خطا!", text: "خطا در ارتباط با سرور", icon: "error", confirmButtonText: "باشه" });
        });
}

function handleCodeSubmit(event) {
    event.preventDefault();

    const codeInput = document.getElementById('Code');
    const codeValue = codeInput.value.trim();
    const returnUrl = document.getElementById('ReturnUrl')?.value
        || new URLSearchParams(window.location.search).get('ReturnUrl');
    fetch('/Smslogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SendCode: codeValue, ReturnUrl: returnUrl })    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ title: "موفق!", text: data.message, icon: "success", confirmButtonText: "باشه" })
                    .then(() => window.location.href = data.redirectUrl);
            } else {
                Swal.fire({ title: "خطا!", text: data.message, icon: "error", confirmButtonText: "باشه" });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ title: "خطا!", text: data.message, icon: "error", confirmButtonText: "باشه" });
        });
}

function toggleForms(showCodeForm) {
    const phoneForm = document.getElementById('phoneForm');
    const codeForm = document.getElementById('codeForm');

    phoneForm.classList.toggle('hidden', showCodeForm);
    codeForm.classList.toggle('hidden', !showCodeForm);
}

function startTimer(duration) {
    const link = document.getElementById("Resend");
    const timeLeftElement = document.getElementById('timeLeft');

    let timer = duration;
    link.style.pointerEvents = "none";
    link.style.opacity = "0.5";

    const timerInterval = setInterval(() => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
        const seconds = String(timer % 60).padStart(2, '0');
        timeLeftElement.textContent = `${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            Swal.fire({ title: "خطا!", text: "زمان کد تایید به پایان رسیده است", icon: "error", confirmButtonText: "باشه" });
            link.style.pointerEvents = "auto";
            link.style.opacity = "1";
        }
    }, 1000);
}

// افزودن رویداد کلیک روی لینک ارسال مجدد
document.getElementById('Resend').addEventListener('click', function (e) {
    e.preventDefault();

   

    ResendVerificationCode();
});
