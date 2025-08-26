//region  activity

function AddActivity() {

    $.ajax({
        type: "Get",
        url: '../../Admin/Activity/Insert',
        contentType: "application/text; charset=utf-8",
        dataType: "text",
        async: false,
        success: function (data) {
            $('.modal-body').html(data);
            $('#myform').data('validator', null);
            $.validator.unobtrusive.parse('#myform');
            $("#myModal").modal("show");

        },
        error: function (response1) {
            console.log(response1);
        }

    })

};
function Update(Id) {

    $.ajax({
        type: "Get",
        url: '../../Admin/Activity/update?ActivityId='+Id,
        contentType: "application/text; charset=utf-8",
        dataType: "text",
        async: false,
        success: function (data) {
            $('.modal-body').html(data);
            $('#myform').data('validator', null);
            $.validator.unobtrusive.parse('#myform');
            $("#myModal").modal("show");

        },
        error: function (response1) {
            console.log(response1);
        }

    })

};

