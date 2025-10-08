function GetCityByProvinceId(Id) {
    $.ajax({
        url: "../../Shop/GetCityByProvinceId?ProId=" + Id,
        method: "GET",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        success: function (data) {
            console.log(data);
            var s = '<option value="-1">شهرها</option>';
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].value);
                console.log(data[i].text);

                s += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
            }
            $("#City").html(s);
        },
        error: function (data) {
            console.log(data);

        }
    });
};