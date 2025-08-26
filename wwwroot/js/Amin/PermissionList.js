$(document).ready(function () {


    if ($('#IsPublicId').find(":selected").val() == 1) {

        $("#searchController").hide();
        $("#ControllerText").hide();
    }
    //else {
    //    alert($('#searchParent').find(":selected").val());
    //    FillController($('#searchParent').find(":selected").val())
    //}

    $('#EditParentMenuID').select2({
        width: 300
    });
    $('#EditSubSystemID').select2({
        width: 300
    });
    $('#ParentMenuID').select2({
        width: 300
    });
    $('#SubSystemID').select2({
        width: 300
    });


});
function insertArea() {


    $.ajax({
        url: "../../Admin/PermissionList/insertArea",
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        beforeSend: function () {
            StartLoading();
        },
        success: function (data) {
            if (data.success == true) {
                StopLoading();
              
                Swal.fire({
                    title: "موفق!",
                    text: data.message,
                    icon: "success",
                    confirmButtonText: "باشه"
                }).then(() => {
                    location.reload();
                });
            }
           

        },
        error: function (data) {
            StopLoading();

          
            Swal.fire({
                title: "خطا!",
                text: "عملیات با خطا انجام شد .",
                icon: "error",
                confirmButtonText: "باشه"
            });

        }


    });

};
function LoadController(MyArea) {


    $.ajax({
        url: "../../Admin/PermissionList/GetController?MyArea=" + MyArea,
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            console.log(data);
            var s = '<option value="-1">بخش ها</option>';
            for (var i = 0; i < data.length; i++) {
                s += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
            }
            $("#SearchController").html(s);
        },
        error: function (data) {
            console.log(data);

        }
    });
};
function FillParent(Id) {
    if (Id == 0) {
        $("#searchController").show();
        $("#ControllerText").show();
    }
    else {
        $("#searchController").hide();
        $("#ControllerText").hide();
    }

    $.ajax({
        url: "../../../Admin/PermissionList/FillParent?Id=" + Id,
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            console.log('suncess');
            //var s = '<option value="-1">والد</option>';
            if (Id == 0) {
                var s = '<option value="0">دسترسی والد</option>';
            }
            else if (Id == 1) {
                var s = '<option value="1">منو والد</option>';
            }
            for (var i = 0; i < data.length; i++) {


                s += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
            }
            $("#searchParent").html(s);
     
        },
        error: function (data) {
            console.log("error");
            alert(data);
            console.log(data);


        }
    });
}

function FillController(Id) {

    $.ajax({
        url: "../../../Admin/PermissionList/FillController?Id=" + Id,
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            console.log('suncess');
            var s = '<option value="-1">بخش ها</option>';
            for (var i = 0; i < data.length; i++) {


                s += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
            }
            $("#searchController").html(s);
        },
        error: function (data) {
            console.log("error");
            alert(data);
            console.log(data);


        }
    });
}
function Edit(Id) {

    $.ajax({
        type: "Get",
        url: '../../Admin/PermissionList/Edit/' + Id,
        contentType: "application/text; charset=utf-8",
        dataType: "text",
        async: false,
        success: function (data) {
            console.log(data);
            $('.modal-body').html(data);
            $('#myform').data('validator', null);
            $.validator.unobtrusive.parse('#myform');
            $("#myModal").modal("show");

        },
        error: function (response1) {
            console.log(response1);
        }

    })
}


function AddParentMenu() {

    $.ajax({
        type: "Get",
        url: '../../Admin/PermissionList/AddParentMenu',
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

}



