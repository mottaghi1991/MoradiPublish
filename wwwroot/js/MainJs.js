// JS برای تغییر کلاس هنگام اسکرول
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});


var swiper = new Swiper('.mySwiper', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination', // المنتی که pagination را در آن قرار داده‌اید
        clickable: true, // قابل کلیک بودن دکمه‌های pagination
    },
    loop: true,
    autoplay: {
        delay: 3000, // هر 3 ثانیه اسلاید بعدی
        disableOnInteraction: false // حتی اگر کاربر با ماوس کلیک کرد، باز ادامه بده
    },
    breakpoints: {

        200: {
            slidesPerView: 1.5, // نمایش ۱ اسلاید
            spaceBetween: 4,
        },
        768: {
            slidesPerView: 1.5, // نمایش ۲ اسلاید
            spaceBetween: 5,
        },
        1024: {
            slidesPerView: 4, // نمایش ۳ اسلاید
            spaceBetween: 1,
        },
    },
});
var swiper1 = new Swiper('.mySwiper1', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination', // المنتی که pagination را در آن قرار داده‌اید
        clickable: true, // قابل کلیک بودن دکمه‌های pagination
    },
    loop: true,
    breakpoints: {

        200: {
            slidesPerView: 1, // نمایش ۱ اسلاید
            spaceBetween: 4,
        },
        768: {
            slidesPerView: 1, // نمایش ۲ اسلاید
            spaceBetween: 5,
        },
        1024: {
            slidesPerView: 3, // نمایش ۳ اسلاید
            spaceBetween: 5,
        },
    },
});