﻿const common = require('../common/common');
const common_register = require('./common');
const data = require('./data');
const createNewWorkHour = require('./createNewWorkHour');
const mainGrid = require('./mainGrid');
const priodlyGrid = require('./bottomPage_priodlyGrid');
const bottomPage_monthlyGrid = require('./bottomPage_monthlyGrid');


const period_next_pervious = require('./period_next_pervious');
const history_sentWorkHour =require('./history_sentWorkHour');
const editWindow=require('./editWorkHour');
const history_workHour = require('./hisotory_workHour');
const sendWorkHour = require('./sendWorkHour');

const common_timeSheet = require('../common/timesheet');

const service = require('./service');




// Document Ready__________

$(document).ready(function () {

    common.loaderShow();

    data.init();
    bottomPage_monthlyGrid.init(data);
    priodlyGrid.init(data);
    service.init(data, common_timeSheet);

    $('#registerTiemSheet_exportToExcel').off().on('click',function(){
        common.doExport('#ktrlTimeSheets', {type: 'excel'});
    });
    $('#registerTiemSheet_exportToDoc').off().on('click',function(){
        common.doExport('#ktrlTimeSheets', { type: 'doc' });
    });
    
    mainGrid.init(common, common_register, createNewWorkHour,history_sentWorkHour,sendWorkHour,data, service);

    mainGrid.GetTimeSheets(function(){
        priodlyGrid.InitPeriodlyByProjectsGrid();
        bottomPage_monthlyGrid.InitMonthlyByProjectsGrid();
        common.loaderHide();
        period_next_pervious.init(common, common_register,mainGrid,
            bottomPage_monthlyGrid,history_sentWorkHour, priodlyGrid,editWindow, data);
            
        editWindow.init(mainGrid, common, common_register,data);
        
        createNewWorkHour.init(common,common_register,period_next_pervious,data,service);
        sendWorkHour.init(mainGrid, common, common_register,data);
        
        history_workHour.init(common, data);
        history_sentWorkHour.init(common,common_register,history_workHour,data);
    });
});




function exportTableToExcel(tableID, filename ){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';
    
    // Create download link element
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Setting the file name
        downloadLink.download = filename;
        
        //triggering the function
        downloadLink.click();
    }
}





