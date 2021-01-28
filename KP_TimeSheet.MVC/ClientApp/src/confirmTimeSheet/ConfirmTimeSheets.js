﻿const common = require('../common/common');
const service = require('./service');
const dataService = require('./data');
const common_timeSheet = require('../common/timesheet');


function KTRColumnConfirm() {
	this.field = "";
	this.title = "";
	this.template = "";
	this.hidden = false;
	this.width = 40;
	this.headerTemplate = "";
	this.filterable = false;
}

$(document).ready(function () {

	dataService.init();
	service.init(dataService, common_timeSheet, common);


	GetUsers();
	WndDeny_OnInit();
	WNDSelectPeriod_OnInit();

	$('#btnpreviousPeriodconfirm').off().on('click', function () {
		GetPreviousNextPeriodconfirm('previous');
	});
	$('#btnSelectPeriodconfirm').off().on('click', function () {
		WNDSelectPeriod_OnOpen();
	});
	$('#btnNextPeriodconfirm').off().on('click', function () {
		GetPreviousNextPeriodconfirm('next');
	});


	$('#btnSendPeriodconfirm').off().on('click', function () {
		btnSendPeriodsconfirm_Onclick();
	});
	$('#btnCancelconfirm').off().on('click', function () {
		WNDSelectPeriod_OnClose();
	});

	$('#btnDeny').off().on('click', function () {
		FinalDeny();
	});
	$('#btnDiscardDeny').off().on('click', function () {
		WndDeny_OnClose();
	});

});

$('input:radio[name="optradioconfirm"]').change(function () {

	EnableAndDisableSendPeriodRadioButtonConfirm(this);

});

$("#numberDaysconfirm").keyup(function () {

	if ($("#numberDaysconfirm").val() > 25) {
		$("#numberDaysconfirm").val("25");
	}
});

function WNDSelectPeriod_OnInit() {

	var kwndSendWHs = $("#kwndSelectTimePeriodConfirm");
	kwndSendWHs.kendoWindow({

		width: common.window_width(),
		height: common.window_height(),

		activate: common.addNoScrollToBody,
		deactivate: common.removeNoScrollToBody,

		scrollable: false,
		visible: false,
		modal: true,
		actions: [
			"Pin",
			"Minimize",
			"Maximize",
			"Close"
		],
		//open: common.adjustSize,
	}).data("kendoWindow").center();
}

function WNDSelectPeriod_OnOpen() {
	$("#kwndSelectTimePeriodConfirm").data("kendoWindow").open()
}

function WNDSelectPeriod_OnClose() {
	$("#kwndSelectTimePeriodConfirm").data("kendoWindow").close();
}

function WndDeny_OnInit() {
	var kwndDeny = $("#WndDeny");
	kwndDeny.kendoWindow({
		width: common.window_width(),
		height: common.window_height(),

		activate: common.addNoScrollToBody,
		deactivate: common.removeNoScrollToBody,

		scrollable: false,
		visible: false,
		modal: true,
		actions: [
			"Pin",
			"Minimize",
			"Maximize",
			"Close"
		],
		//open: common.adjustSize,
	}).data("kendoWindow").center();
}

function WndDeny_OnOpen() {

	$("#WndDeny").data("kendoWindow").open()

}

function WndDeny_OnClose() {
	$("#WndDeny").data("kendoWindow").close();
}

function RefreshTimeSheetConfirm() {
	common.loaderShow();

	service.getTimeSheetsByUserIdForFirstTime((response) => {

		private_Refresh(response);

	});

}

function private_Refresh(response) {
	removeAndRecreateTreelisConfirmDiv();

	Init_TimeSheetTreeListConfirm(response);
	InitMonthlyByProjectsGridConfirm();
	InitPeriodlyByProjectsGridConfirm();
	$("#DownSideTabsConfirm").show();
	$("#PeriodPanle").show();
	$("#ExportNavConfirm").show();
	common.loaderHide();
}

function removeAndRecreateTreelisConfirmDiv() {

	if (!$("#ktrlTimeSheetsConfirm").data("kendoTreeList")) return;
	$("#ktrlTimeSheetsConfirm").data("kendoTreeList").destroy();
	$("#ktrlTimeSheetsConfirm").remove();
	$("#KTLContainerRegisterConfirm").append("<div id='ktrlTimeSheetsConfirm'></div>");
}
function GetUsers() {

	service.getUsersInCurrentUserOrganisation((response) => {
		$("#kddlUsers").kendoDropDownList({
			dataTextField: "fullName",
			dataValueField: "id",
			filter: "contains",
			optionLabel: {
				fullName: "انتخاب کاربر . . . ",
				id: ""
			},
			dataSource: {
				transport: {
					read: function (e) {
						e.success(dataService.users_get());
					}
				}
			},
			index: 0,
			change: kddlUsers_OnChange
		});
	});
}

function kddlUsers_OnChange(e) {

	common.loaderShow();
	dataService.userId_set($("#kddlUsers").data("kendoDropDownList").dataItem($("#kddlUsers").data("kendoDropDownList").select()).id);

	if (dataService.userId_get() != "") {

		RefreshTimeSheetConfirm();

	} else {
		common.loaderHide();
		common.notify("کاربری انتخاب نشده ", "warning");
	}

}

function Init_TimeSheetTreeListConfirm(data) {

	var ktrlTSColumnsConfirm = ktrlTimeSheetsConfirm_OnInitColumns(data);
	var timeSheetData = data.slice(1);

	$("#ktrlTimeSheetsConfirm").kendoTreeList({
		dataSource: {
			transport: {
				read: function (e) {
					e.success(timeSheetData);
				},
			}
		},
		schema: {
			model: {
				id: "id",
				parentId: "parentId"
			}
		},
		expanded: true,
		selectable: true,
		height: 400,
		columns: ktrlTSColumnsConfirm,
		dataBound: ktrlTimeSheetsConfirm_dataBound
	});

}

function ktrlTimeSheetsConfirm_OnInitColumns(response) {

	var columns = [];

	var colId = new KTRColumn();
	colId.field = "id";
	colId.title = "شناسه";
	colId.hidden = true;
	colId.width = 10;
	columns.push(colId);

	var colParentId = new KTRColumnConfirm();
	colParentId.field = "parentId";
	colParentId.title = "شناسه پدر";
	colParentId.hidden = true;
	colParentId.width = 10;
	columns.push(colParentId);

	var colTitle = new KTRColumnConfirm();

	//colTitle.field = "title";
	colTitle.title = "عنوان";
	colTitle.hidden = false;
	colTitle.width = 150;
	colTitle.template = (data)=>{
		if(!data.has_NotApproveData){
			return data.title;
		}

		const color= data.type == '-' ? 'style="color:gray"' : (data.type == 'Project' ? 'style="color:#00848C"' : 'style="color:#117243"');
		const bc= data.type == '-' ? ';background-color:white' : (data.type == 'Project' ? ';background-color:#E5F0FF' :';background-color:#CEFF9D');
		const title= data.type == '-' ? `همه کارکردهای تایید نشده` : (data.type == 'Project' ? `همه کارکردهای تایید نشده پروژه ${data.title}` : `همه کارکردهای تایید نشده فعالیت ${data.title}`);


		return data.title +`<button title='${title}' data-type='${data.type}' data-uid='${data.uuiidd}'
		class='pull-left btn btn-success btn-xs forFound_ApproveTaskAllDates' 
		style='margin-right:5px;padding: 4px 4px 0 ${bc};'>
			<i class='glyphicon glyphicon-ok' ${color}></i>
		</button>`
		
	};
	columns.push(colTitle);

	///-----------------------------------------------------------------

	for (var i = 0; i < response[0].values.length; i++) {

		const index = i;

		var tsDate = response[0].values[i];
		var colDate = new KTRColumnConfirm();
		//colDate.field = "values[" + i + "].value";
		colDate.title = tsDate.title;
		colDate.headerTemplate = "<h6><b>" + tsDate.persianDate + "</b></h6><h6><span>" + tsDate.persianDay + "</span></h6>";
		colDate.hidden = false;
		//تخصیص متد به تپلیت فقط باید ایندکس ها تنظیم گرددند
		colDate.template = (dataItem) => TreeListTemplateColumn(dataItem, index);
		colDate.width = 50;
		columns.push(colDate);

	}
	return columns;
}

function KTRColumn() {
	this.field = "";
	this.title = "";
	this.template = "";
	this.hidden = false;
	this.width = 40;
	this.headerTemplate = "";
	this.filterable = false;
}

function TreeListTemplateColumn(dataItem, index) {

	if (index >= dataItem.values.length) return "";

	if (dataItem.has_NotApproveData && dataItem.values[index].value!='' &&  dataItem.values[index].value!='0:00') {

		const color= dataItem.type == '-' ? 'style="color:gray"' : (dataItem.type == 'Project' ? 'style="color:#00848C"' : 'style="color:#117243"');
		const bc= dataItem.type == '-' ? ';background-color:white' : (dataItem.type == 'Project' ? ';background-color:#E5F0FF' :';background-color:#CEFF9D');
		const title= dataItem.type == '-' ? `کارکردهای تایید نشده در ${dataItem.values[index].persianDate}` : 
					(dataItem.type == 'Project' ? `کارکردهای تایید نشده پروژه ${dataItem.title} در ${dataItem.values[index].persianDate}` : 
						`کارکردهای تایید نشده فعالیت ${dataItem.title} در ${dataItem.values[index].persianDate}`);

		return dataItem.values[index].value +
			`<button title='${title}' data-uid='${dataItem.uuiidd}' data-index='${index}' data-type='${dataItem.type}' 
				 class='pull-left btn btn-success btn-xs forFound_ApproveTask' style='margin-right:5px;padding: 4px 4px 0 ${bc};'>
				 <i class='glyphicon glyphicon-ok' ${color}></i></button>`;
			
	}
	else {
		if (dataItem.values[index].value == "0:00") {
			return "<b class='text-warning'>" + dataItem.values[index].value + " </b>"
		}
		else if (dataItem.values[index].value == "") {
			return "<b class='text-warning'> </b>"
		}
		else {
			return "<b>" + dataItem.values[index].value + " </b>"
		}
	}

}

function ktrlTimeSheetsConfirm_dataBound(e) {
	$('.forFound_ApproveTask').off().on('click', function () {
		const id = $(this).data("uid");
		const index = $(this).data("index");
		const type = $(this).data("type");

		alert('id:'+ id+ ' type:' + type + ' index:'+ index);
		//ApproveTask(uid, index);
	});

	$('.forFound_ApproveTaskAllDates').off().on('click', function () {
		const id = $(this).data("uid");
		const type = $(this).data("type");
		var timesheetData = dataService.timeSheetDataConfirm_get()[0];
		alert('id:'+ id+ ' type:' + type);
	});


}

function ApproveTask(id, index) {
	common.loaderShow();

	for (var i = 0; i < dataService.timeSheetDataConfirm_get().length; i++) {
		if (dataService.timeSheetDataConfirm_get()[i].uid == id) {
			var da = dataService.timeSheetDataConfirm_get()[i].values[index];
		}
	}

	var data = {
		date: da.date,
		id: id,
	};

	var prmData = JSON.stringify(data);

	service.approveWorkHour(prmData, (response) => {
		GetCurrentPeriodconfirm();
		if (response && response.message) common.notify(response.message, "success");
	});

}

function FinalDeny() {

	common.loaderShow();

	for (var i = 0; i < dataService.timeSheetDataConfirm_get().length; i++) {
		if (dataService.timeSheetDataConfirm_get()[i].uid == dataService.selectedTaskIdForDeny_get()) {
			var da = dataService.timeSheetDataConfirm_get()[i].values[dataService.selectedIndexDorDeny_get()];
		}
	}

	var data = {
		date: da.date,
		id: dataService.selectedTaskIdForDeny_get(),
		description: $("#comment").val()
	};

	var prmData = JSON.stringify(data);

	service.denyWorkHour(prmData, (response) => {
		WndDeny_OnClose();
		GetCurrentPeriodconfirm();
		if (response && response.message) common.notify(response.message, "success");
	});

}

function DenyTask(id, index) {

	dataService.selectedTaskIdForDeny_set(id);
	dataService.selectedIndexDorDeny_set(index);
	WndDeny_OnOpen()
}


function GetCurrentPeriodconfirm() {

	common.loaderShow();
	RefreshTimeSheetConfirm();
}


function InitMonthlyByProjectsGridConfirm() {

	dataService.userId_set($("#kddlUsers").data("kendoDropDownList").dataItem($("#kddlUsers").data("kendoDropDownList").select()).id);

	var json = {
		value: dataService.timeSheetDataConfirm_get()[0].values[0],
		userid: dataService.userId_get()
	}


	var prmData = JSON.stringify(json);
	service.getThisMonthDataByUser(prmData, (response) => {

		const items = [response.presencepercent, response.workpercent];
		const v1 = common_timeSheet.calcPercent(items, response.presencepercent);
		const v2 = common_timeSheet.calcPercent(items, response.workpercent);

		$("#MonthlyPresenceconfirmProgress").text(common_timeSheet.convertMinutsToTime(response.presence));
		$("#MonthlyWorkHourconfirmProgress").text(common_timeSheet.convertMinutsToTime(response.work));

		$("#MonthlyPresenceconfirm").css('width', v1 + '%').attr('aria-valuenow', v1);
		$("#MonthlyWorkHourconfirm").css('width', v2 + '%').attr('aria-valuenow', v2);


		common.loaderHide();
	});

	service.getThisMonthProjectsByUserID(prmData, (response) => {
		$("#tblcurrmonthconfirm").kendoGrid({
			dataSource: {
				transport: {
					read: function (e) {
						e.success(response)
					}
				},
				pageSize: 20
			},
			height: 200,
			columns: [{
				field: "title",
				title: "عنوان پروژه"
			}, {
				field: "hour",
				title: "ساعت کار ثبت شده    "
			}]
		});

		$("#DownSideTabsConfirm").show();
	});

}

function InitPeriodlyByProjectsGridConfirm() {
	dataService.userId_set($("#kddlUsers").data("kendoDropDownList").dataItem($("#kddlUsers").data("kendoDropDownList").select()).id);
	var json = {
		values: dataService.timeSheetDataConfirm_get()[0].values,
		userid: dataService.userId_get()
	}

	var prmData = JSON.stringify(json);

	service.getThisPeriodDataByUserId(prmData, (response) => {

		const items = [response.presencepercent, response.workpercent];
		const v1 = common_timeSheet.calcPercent(items, response.presencepercent);
		const v2 = common_timeSheet.calcPercent(items, response.workpercent);

		$("#PeriodicallyPresenceconfirmProgress").text(common_timeSheet.convertMinutsToTime(response.presence));
		$("#PeriodicallyWorkHourconfirmProgress").text(common_timeSheet.convertMinutsToTime(response.work));

		$("#PeriodicallyPresenceconfirm").css('width', v1 + '%').attr('aria-valuenow', v1);
		$("#PeriodicallyWorkHourconfirm").css('width', v2 + '%').attr('aria-valuenow', v2);
	});

	service.getThisPeriodProjectsByUserId(prmData, (response) => {
		$("#tblcurrperiodconfirm").kendoGrid({
			dataSource: {
				transport: {
					read: function (e) {
						e.success(response)
					}
				},
				pageSize: 20
			},
			height: 200,


			columns: [{
				field: "title",
				title: "عنوان پروژه"
			}, {
				field: "hour",
				title: "ساعت کار ثبت شده"
			}]
		});
	});

}

function btnSendPeriodsconfirm_Onclick() {
	common.loaderShow();
	dataService.userId_set($("#kddlUsers").data("kendoDropDownList").dataItem($("#kddlUsers").data("kendoDropDownList").select()).id);
	WNDSelectPeriod_OnClose()
	if ($('#chkweeklyconfirm').is(':checked')) {

		service.changeDisplayPeriodToWeeklyConfirm(() => {
			RefreshTimeSheetConfirm();
		});

	}
	else {
		var PeriodJson = {
			Date: $("#startDateconfirm").val(),
			Days: $("#numberDaysconfirm").val(),
			IsWeekly: false,
			UserId: dataService.userId_get()
		};

		var prmData = JSON.stringify(PeriodJson);
		service.changeDisplayPeriodToDaily(prmData, () => {
			RefreshTimeSheetConfirm();
		});
	}

}

function GetPreviousNextPeriodconfirm(type) {
	common.loaderShow();

	dataService.userId_set($("#kddlUsers").data("kendoDropDownList").dataItem($("#kddlUsers").data("kendoDropDownList").select()).id);

	let startDate = null;
	let endDate = null;

	if (type == 'previous') {
		startDate = dataService.timeSheetDataConfirm_get()[0].values[0].date;
	} else {
		var firstData = dataService.timeSheetDataConfirm_get()[0];
		endDate = firstData.values[firstData.values.length - 1].date;
	}

	service.getPreviousNextPeriodConfirm(dataService.userId_get(), startDate, endDate, (response) => {
		private_Refresh(response);
	});
}




function EnableAndDisableSendPeriodRadioButtonConfirm() {

	if ($("#numberDaysconfirm").is(':disabled')) {

		$("#numberDaysconfirm").prop("disabled", false);
		$("#startDateconfirm").prop("disabled", false);

	} else {
		$("#numberDaysconfirm").prop("disabled", true);
		$("#startDateconfirm").prop("disabled", true);
	}

}
