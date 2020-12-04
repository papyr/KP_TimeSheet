const common_register = require('./common');
const data = require('./data');

// ________________ارسال تایم شیت

function wndSendWorkHour_OnClose() {
    $("#wndSendWorkHour").data("kendoWindow").close()
}

function GRDSendWorkHours_onInit(sendItem) {

    var ktrlTimeSheetsSend = $("#ktrlTimeSheets").data('kendoTreeList').dataItem($("#" + sendItem).closest("tr"));
    data.selDate_set(ktrlTimeSheetsSend.values[parseInt($("#" + sendItem).attr('dayindex')) - 3]);

    $("#SenddateTitle").text(data.selDate_get().PersianDate);

    var workHourJson = {
        ID: null,
        Date: data.selDate_get().Date,
    };
    var prmData = JSON.stringify(workHourJson);
    $.ajax({
        type: "Post",
        url: "/api/TimeSheetsAPI/GetUnConfirmedWorkHours",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: prmData,
        success: function (response) {
            _AllReadyForSent = 0
            for (var i = 0; i < response.length; i++) {
                _AllReadyForSent = _AllReadyForSent + response[i].Hours
            }
            $("#SumReadyForSentWorkHours").text(_AllReadyForSent);

            $.ajax({
                type: "Post",
                url: "/api/TimeSheetsAPI/GetPresenceHourByDate",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: prmData,
                success: function (response) {
                    _presenceHour = response.Hours

                    $("#presenceHour").text(_presenceHour);

                },
                error: function (e) {

                }
            });
            $.ajax({
                type: "Post",
                url: "/api/TimeSheetsAPI/GetConfirmedWorkHours",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: prmData,
                success: function (response) {
                    _AllSentCount = 0
                    for (var i = 0; i < response.length; i++) {
                        _AllSentCount = _AllSentCount + response[i].Hours
                    }
                    $("#SumSentWorkHours").text(_AllSentCount);
                    $("#GRDSendWorkHours").data("kendoGrid").dataSource.read();
                },
                error: function (e) {

                }
            });
            _SendWorkHourGrid = response;

            $("#GRDSendWorkHours").kendoGrid({
                dataSource: {
                    transport: {
                        read: function (e) {
                            e.success(_SendWorkHourGrid)
                        }
                    },
                    pageSize: 20
                },
                height: 400,
                pageable: true,
                columns: [{
                    field: "PersianDate",
                    title: "تاریخ"
                },
                {
                    field: "ProjectTitle",
                    title: "پروژه"
                }, {
                    field: "TaskTitle",
                    title: "وظیفه"
                }, {
                    field: "Hours",
                    title: "ساعت کار ثبت شده    "
                },


                {
                    title: "ارسال ",
                    template: "<button   onclick='SendWorkHour_OnClick(this)' type='button' class='btn btn-success btn-sm' name='info' title='ارسال' > ارسال</button>",
                    headerTemplate: "<label class='text-center'> ارسال </label>",
                    filterable: false,
                    sortable: false,
                    width: 100
                },
                {
                    title: "حذف ",
                    template: "<button  onclick='DeleteWorkHourSendGrid(this)' type='button' class='btn btn-danger btn-sm' name='info' title='حذف' > حذف</button>",
                    headerTemplate: "<label class='text-center'> حذف </label>",
                    filterable: false,
                    sortable: false,
                    width: 100
                },
                ]

            });
        },
        error: function (e) {

        }
    });
}

function wndSendWorkHour_OnInit(SendWHsIdx) {

    data.sendItem_set(SendWHsIdx);
    var wndSendWorkHour = $("#wndSendWorkHour");
    wndSendWorkHour.kendoWindow({
        width: "750px",
        height: "670",

        scrollable: false,
        visible: false,
        modal: true,
        actions: [
            "Pin",
            "Minimize",
            "Maximize",
            "Close"
        ],
        open: common_register.adjustSize,
    }).data("kendoWindow").center().open();

    GRDSendWorkHours_onInit(data.sendItem_get());
}

function SendAllWorkHours_OnClick() {
    var ktrlTimeSheetsSend = $("#ktrlTimeSheets").data('kendoTreeList').dataItem($("#" + data.sendItem_get().id).closest("tr"));
    data.selDate_set(ktrlTimeSheetsSend.values[parseInt($("#" + data.sendItem_get().id).attr('dayindex')) - 3]);

    var workHourJson = {
        ID: null,
        Date: data.selDate_get().Date,
    };
    var prmData = JSON.stringify(workHourJson);
    $.ajax({
        type: "Post",
        url: "/api/TimeSheetsAPI/SendWorkHours",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: prmData,
        success: function (response) {
            _AllSentCount = 0

            for (var i = 0; i < response.length; i++) {
                _AllSentCount = _AllSentCount + response[i].Hours
            }
            $("#SumSentWorkHours").text(_AllSentCount);
            for (var i = 0; i < response.length; i++) {
                if (response[0] == "عملیات ارسال کارکرد ها با موفقیت انجام گردید") {
                    common.Notify(response[i], "success");
                } else {
                    common.Notify(response[i], "danger");
                }
            }

            wndSendWorkHour_OnClose();

        },
        error: function (e) {

        }
    });
}

function SendWorkHour_OnClick(e) {

    var grid = $("#GRDSendWorkHours").data("kendoGrid");
    var dataItem = grid.dataItem($(e).closest("tr"));


    var workHourJson = {
        ID: dataItem.ID,
        Date: data.selDate_get().Date,
    };

    var prmData = JSON.stringify(workHourJson);
    $.ajax({
        type: "Post",
        url: "/api/TimeSheetsAPI/SendWorkHour",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: prmData,
        success: function () {
            //wndSendWorkHour_OnClose();
            Refresh_GRDSendWorkHour();
            common.Notify("انجام عملیات  ارسال با موفقیت به انجام رسید.", "success");
        },
        error: function (e) {

        }
    });

}

function Refresh_GRDSendWorkHour() {
    var workHourJson = {
        ID: null,
        Date: data.selDate_get().Date,
    };

    var prmData = JSON.stringify(workHourJson);

    $.ajax({
        type: "Post",
        url: "/api/TimeSheetsAPI/GetUnConfirmedWorkHours",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: prmData,
        success: function (response) {
            _AllReadyForSent = 0

            for (var i = 0; i < response.length; i++) {
                _AllReadyForSent = _AllReadyForSent + response[i].Hours
            }
            $("#SumReadyForSentWorkHours").text(_AllReadyForSent);
            $.ajax({
                type: "Post",
                url: "/api/TimeSheetsAPI/GetPresenceHourByDate",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: prmData,
                success: function (response) {
                    _presenceHour = response.Hour

                    $("#presenceHour").text(_presenceHour);

                },
                error: function (e) {

                }
            });
            $.ajax({
                type: "Post",
                url: "/api/TimeSheetsAPI/GetConfirmedWorkHours",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: prmData,
                success: function (response) {
                    _AllSentCount = 0
                    for (var i = 0; i < response.length; i++) {
                        _AllSentCount = _AllSentCount + response[i].Hours
                    }
                    $("#SumSentWorkHours").text(_AllSentCount);
                    $("#GRDSendWorkHours").data("kendoGrid").dataSource.read();
                },
                error: function (e) {

                }
            });
            _SendWorkHourGrid = response;
            $("#GRDSendWorkHours").data("kendoGrid").dataSource.read();
        },
        error: function (e) {

        }
    });
}

module.exports={
    'wndSendWorkHour_OnInit':wndSendWorkHour_OnInit
};
