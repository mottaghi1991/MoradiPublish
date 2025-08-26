function StartLoading(selector = 'body') {
    $(selector).waitMe({
        effect: 'bounce',
        text: 'لطفا تا پایان عملیات صبر کنید',
        bg: ' rgba(255, 255, 255, 0.7)',
        color: '#000'
    });
};

function StopLoading(selector = 'body') {
    $(selector).waitMe('hide');
};
$(document).ready(function () {
    //    $('.MyDateTime').datepicker({ dateFormat: "yy/mm/dd", isRTL: true, showButtonPanel: true });
    var dat = document.querySelectorAll(".MyDateTime");
    if (dat.length) {
        console.log(dat);
        for (da of dat) {
            var id = $(da).attr("id");
            kamaDatepicker(id, {
                markToday: true,
                markHolidays: true,
                sync: true,
                gotoToday: true
            })

        }
    }

    $('.table').addClass("table-striped");
    $('.table').addClass("table-responsive");
    $('.table').addClass("text-center");
    $('.myselect').select2();
});
//const textarea = document.getElementById('FlexText');

//textarea.addEventListener('input', function () {
//    this.style.height = 'auto'; // ارتفاع را ریست می‌کنیم.
//    this.style.height = `${this.scrollHeight}px`; // ارتفاع را بر اساس محتوا تنظیم می‌کنیم.
//});