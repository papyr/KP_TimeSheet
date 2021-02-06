const approveWindow = (function () {

  const moduleData = {};

  function init(common, service, data, parentRefreshCommand) {
    moduleData.common = common;
    moduleData.service = service;
    moduleData.data = data;
    moduleData.thisGridType = null;
    moduleData.lastGetApproveDataFromServer = null;
    moduleData.parentRefreshCommand = parentRefreshCommand;

    $('#GrdMonitorWaitingApproveWorkHour_Hide').off().on('click', function () {
      $("#WndItemsWaitingApprove").data("kendoWindow").close();
    });

    $('#GrdMonitorWaitingApproveWorkHour_Send').off().on('click', function () {
      private_sendApproveDenyDataToServer();
    });

    $('#GrdMonitorWaitingApproveWorkHour_ApproveAll').off().on('click', function () {
      private_doApproveDenyAll('approve');
    });

    $('#GrdMonitorWaitingApproveWorkHour_DenyAll').off().on('click', function () {
      private_doApproveDenyAll('deny');
    });

    $('#btnWorkHoureHistory_hide').off().on('click', function () {
			HideHistory();
		});
  }

  function private_sendApproveDenyDataToServer() {

    $('#GrdMonitorWaitingApproveWorkHour_Send').attr("disabled", "disabled");

    var items = $("#GrdMonitorWaitingApproveWorkHour").data("kendoGrid").dataSource.data();

    var wanted = 'id';
    if (moduleData.thisGridType == 'workhour') wanted = 'workHourId';

    var approved = [];
    var denyed = [];
    items.forEach(i => {
      if (i.isApprove) approved.push({ id: i[wanted], description: i.newDescription });
      if (i.isDeny) denyed.push({ id: i[wanted], description: i.newDescription });
    });

    moduleData.service.approveDenyItems(moduleData.thisGridType, approved, denyed, (data) => {
      moduleData.common.notify(data.message);

      if (moduleData.lastGetApproveDataFromServer) moduleData.lastGetApproveDataFromServer();

      $('#GrdMonitorWaitingApproveWorkHour_Send').removeAttr("disabled");
      debugger;
      moduleData.parentRefreshCommand();

    }, () => {
      $('#GrdMonitorWaitingApproveWorkHour_Send').removeAttr("disabled");
    });

  }

  function private_doApproveDenyAll(type) {

    const grid = $("#GrdMonitorWaitingApproveWorkHour").data("kendoGrid");

    var items = [];

    grid.tbody.find('tr').each(function () {
      const item = grid.dataItem($(this));
      items.push(item);
    });

    items.forEach(i => {
      i.set(type == 'approve' ? "isApprove" : "isDeny", true);
      i.set(type == 'approve' ? "isDeny" : "isApprove", null);
    });
  }

  function showItemsWaitingApproveWindow(projectId, taskId, date, notNeedOpenWindow) {

    moduleData.lastGetApproveDataFromServer = () => showItemsWaitingApproveWindow(projectId, taskId, date, true);

    moduleData.thisGridType = null;
    moduleData.common.loaderShow();

    let startDate = date;
    let endDate = date;

    if (!date) {
      var timeSheetData = moduleData.data.timeSheetDataConfirm_get()[0];
      startDate = timeSheetData.values[0].date;
      endDate = timeSheetData.values[timeSheetData.values.length - 1].date;

    }

    var data = {
      wantedUserId: moduleData.data.userId_get(),
      startDate: startDate,
      endDate: endDate
    };

    if (projectId) data.projectId = projectId;
    if (taskId) data.taskId = taskId;

    moduleData.service.getWaitingApproveWorkHourDetail(data, (response) => {

      moduleData.thisGridType = 'workhour';

      if (!notNeedOpenWindow) private_open_GrdMonitorSentWorkHour();

      var columns = [
        {
          title: "",
          template: function (dataItem, b, c) {
            let answer = dataItem.isSend ?
              '<i class="glyphicon glyphicon-upload" title="ارسال شده" style="color:gray; font-size:22px;"></i>'
              : '<i class="glyphicon glyphicon-download" title="برگشت شده" style="color:gray; font-size:22px;"></i>';
            return answer;
          },
          width: 40,
          editable: () => false
        },
        {
          field: "date_persian",
          title: "تاریخ",
          width: 100,
          editable: () => false
        },
        {
          field: "projectTitle",
          title: "پروژه",
          editable: () => false
        }, {
          field: "title",
          title: "وظیفه",
          editable: () => false
        }, {
          field: "minutes",
          title: "ساعت کار",
          width: 80,
          editable: () => false,
        }
        , {
          field: "description",
          title: "آخرین توضیحات",
          editable: () => false
        }
        , {
          field: "newDescription",
          title: "توضیحات تایید یا رد",
          filterable: false,
          sortable: false,
        }
        , {
          field: "isApprove",
          title: "تایید",
          type: "boolean",
          width: 50,
          filterable: false,
          sortable: false,
        }, {
          field: "isDeny",
          title: "رد",
          type: "boolean",
          width: 50,
          filterable: false,
          sortable: false,
        },
        {
          title: "",
          template: function (dataItem, b, c) {
            let answer = "<button type='button' class='btn btn-info btn-sm forFound_Init_GRDHistory' title='نمایش تاریخچه' name='info'>تاریخچه</button>";
            return answer;
          },
          filterable: false,
          sortable: false,
          width: 80
        }
      ];
      private_createEditGrid(response, columns, 7);

      moduleData.common.loaderHide();
    });

  }

  function showItemsWaitingApproveWindow_ForMissionLeave(isHourlyMission, isHourlyLeave, isDailyLeave, date, notNeedOpenWindow) {

    moduleData.lastGetApproveDataFromServer = () => showItemsWaitingApproveWindow_ForMissionLeave(isHourlyMission, isHourlyLeave, isDailyLeave, date, true);

    moduleData.thisGridType = null;
    moduleData.common.loaderShow();

    let startDate = date;
    let endDate = date;

    if (!date) {
      var timeSheetData = moduleData.data.timeSheetDataConfirm_get()[0];
      startDate = timeSheetData.values[0].date;
      endDate = timeSheetData.values[timeSheetData.values.length - 1].date;
    }

    var data = {
      wantedUserId: moduleData.data.userId_get(),
      startDate: startDate,
      endDate: endDate
    };

    if (isHourlyMission) data.type = 1;
    if (isHourlyLeave) data.type = 2;
    if (isDailyLeave) data.type = 3;

    moduleData.service.getWaitingApproveMissionLeaveDetail(data, (response) => {

      moduleData.thisGridType = data.type;
      if (!notNeedOpenWindow) private_open_GrdMonitorSentWorkHour();

      var columns = [
        {
          title: "",
          template: function (dataItem, b, c) {
            let answer = dataItem.isSend ?
              '<i class="glyphicon glyphicon-upload" title="ارسال شده" style="color:gray; font-size:22px;"></i>'
              : '<i class="glyphicon glyphicon-download" title="برگشت شده" style="color:gray; font-size:22px;"></i>';
            return answer;
          },
          width: 40,
          editable: () => false
        },
        {
          field: "from",
          title: "از",
          width: 130,
          editable: () => false
        }
        ,
        {
          field: "to",
          title: "تا",
          width: 130,
          editable: () => false
        }
        , {
          field: "description",
          title: "آخرین توضیحات",
          editable: () => false
        }
        , {
          field: "newDescription",
          title: "توضیحات تایید یا رد",
          filterable: false,
          sortable: false,
        }
        , {
          field: "isApprove",
          title: "تایید",
          type: "boolean",
          width: 50,
          filterable: false,
          sortable: false,
        }, {
          field: "isDeny",
          title: "رد",
          type: "boolean",
          width: 50,
          filterable: false,
          sortable: false,
        },
        {
          title: "",
          template: function (dataItem, b, c) {
            let answer = "<button type='button' class='btn btn-info btn-sm forFound_Init_GRDHistory' title='نمایش تاریخچه' name='info'>تاریخچه</button>";
            return answer;
          },
          filterable: false,
          sortable: false,
          width: 80
        }
      ];

      private_createEditGrid(response, columns, 5);

      moduleData.common.loaderHide();
    });

  }

  function private_createEditGrid(response, columns, approveColumnIndexNumber) {

    var data = $("#GrdMonitorWaitingApproveWorkHour").data("kendoGrid");
    if (data) data.destroy();

    var grid = $("#GrdMonitorWaitingApproveWorkHour").kendoGrid();
    var options = {
      dataSource: {
        transport: {
          read: function (e) {
            e.success(response);

            $('.forFound_Init_GRDHistory').off().on('click', function () {
              private_init_GRDHistory(this);
            });

          }
        },
        pageSize: 10
      },
      height: 450,
      pageable: true,
      filterable: true,
      selectable: true,

      columns: columns,
      editable: true,
      cellClose: function (e) {
        const cellIndex = e.container[0].cellIndex; //7 -> approve  8-> deny

        var select = this.select();
        var data = this.dataItem(select);

        if (cellIndex == approveColumnIndexNumber) {
          if (data.isApprove == null) return;
          data.set("isDeny", null);
        }
        if (cellIndex == approveColumnIndexNumber + 1) {
          if (data.isDeny == null) return;
          data.set("isApprove", null);
        }
      }

    };

    $("#GrdMonitorWaitingApproveWorkHour").data("kendoGrid").setOptions(options);

  }


  function Create_GrdHistory(data) {

		$("#WorkHourHistory").kendoGrid({
			dataSource: {
				transport: {
					read: function (e) {
						e.success(data);
					}
				},
				pageSize: 10
			},
			height: 450,
			pageable: true,
			filterable: true,
			selectable: true,

			columns: [{
				field: "persianDate",
				title: "تاریخ",
				width: 100
			},
			{
				field: "time",
				title: "ساعت",
				width: 80
			},
			{
				field: "managerName",
				title: "نام اقدام کننده",
				width: 200
			}, {
				field: "action",
				title: "عملیات",
				width: 120
			}, {
				field: "stageTitle",
				title: "مرحله",
				width: 120

			}, {
				field: "description",
				title: "توضیحات",
				width: 400

			}
			]

		});
	}

  function private_init_GRDHistory(e){

    debugger;

    var grid = $("#GrdMonitorWaitingApproveWorkHour").data("kendoGrid");
		var dataItem = grid.dataItem($(e).closest("tr"));
		
		$.ajax({
			type: "Get",
			url: `/api/timesheetsNew/GetHistoryWorkHour/${dataItem.workHourId ? dataItem.workHourId : workHourId.id}`,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function (response) {
				Create_GrdHistory(response);
				$("#WorkHourHistory").data("kendoGrid").dataSource.read();
				ShowHistory();
				moduleData.common.loaderHide();
			},
			error: function (e) {

			}
		});
  }

  function private_open_GrdMonitorSentWorkHour() {
    HideHistory();
    moduleData.common.openWindow('WndItemsWaitingApprove');
  }

  function ShowHistory() {
    $("#PanelMonitorWorkHour").fadeOut(400);

    $("#PanelHistory").fadeIn(400);
    var gridElement = $("#WorkHourHistory");
    var dataArea = gridElement.find(".k-grid-content");
    gridElement.height("100%");
    dataArea.height("372px");
  }

  function HideHistory() {
    $("#PanelMonitorWorkHour").fadeIn(400);
    $("#PanelHistory").fadeOut(400);
  }

  return {
    showItemsWaitingApproveWindow: showItemsWaitingApproveWindow,
    showItemsWaitingApproveWindow_ForMissionLeave: showItemsWaitingApproveWindow_ForMissionLeave,
    init: init
  };

})();

module.exports = {
  showItemsWaitingApproveWindow: approveWindow.showItemsWaitingApproveWindow,
  showItemsWaitingApproveWindow_ForMissionLeave: approveWindow.showItemsWaitingApproveWindow_ForMissionLeave,
  init: approveWindow.init
};