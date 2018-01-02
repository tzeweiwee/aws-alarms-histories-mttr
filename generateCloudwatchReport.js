const alarmsHistory = require("./alarmsHistory.json").data;
const  fs = require('fs');

let alarmStats = {};
let alarmStatsByMonth = {};
let csvResults;

const OkToAlarm = 'OK to ALARM';
const AlarmToOk = 'ALARM to OK';
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function processMessage(){
    // to each alarm
    alarmsHistory.forEach(alarmHistoryItems => {
        //to each alarm state actions totally unreadable. i know.
        if (alarmHistoryItems['AlarmHistoryItems'].length > 1){
            let timestamps = [];
            let prevTimestamp = null;
            let AlarmToOKCounts = 0;
            let AlarmName = alarmHistoryItems['AlarmHistoryItems'][0].AlarmName;
            alarmHistoryItems['AlarmHistoryItems'].forEach(item => {
                if (item['HistorySummary'].indexOf(OkToAlarm) > 0 && prevTimestamp != null) {
                    let currentTimestamp = new Date(item['Timestamp']);
                    let diffMins = Math.round((prevTimestamp.getTime() - currentTimestamp.getTime()) / 60000);
                    timestamps.push({'time': diffMins, 'month': monthNames[currentTimestamp.getMonth()] + currentTimestamp.getFullYear()});
                    AlarmToOKCounts++;
                } else if (item['HistorySummary'].indexOf(AlarmToOk) > 0){
                    prevTimestamp = new Date(item['Timestamp']);
                }
            });
            if (timestamps.length > 0){
                timestamps.forEach(time => {
                    if(alarmStatsByMonth.hasOwnProperty(time.month) == false){
                        alarmStatsByMonth[time.month] = [];
                    }
                    alarmStatsByMonth[time.month].push({'AlarmName': AlarmName, 'RecoveryTime': time.time});
                });
            }
        }
    });

    let alarms = {};

    // generate by month
    for (month in alarmStatsByMonth){
        alarms[month] = {};
        //each month
        alarmStatsByMonth[month].forEach(alarm => {
            if(alarms[month].hasOwnProperty(alarm.AlarmName) == false){
                alarms[month][alarm.AlarmName] = [];
            }
            alarms[month][alarm.AlarmName].push(alarm.RecoveryTime);
        });
    }

    //generate mttr
    for (month in alarms) {
        for (alarm in alarms[month]) {
            alarms[month][alarm] = {'MTTR': getMTTR(alarms[month][alarm]), 'Count':alarms[month][alarm].length};
        }
    }

    alarmStats = alarms;
        //     console.log("Alarms Stats By Month in JSON: ", alarmStatsByMonth);
        //     console.log("Alarms MTTR in JSON: ", alarmStats);
    writeAlarmStatsToCSV(convertArrayOfObjectsToCSV(alarmStats, ['Month', 'Alarm Name', 'MTTR (mins)', 'Count']), 'alarms-mttr');
    writeAlarmStatsToCSV(convertArrayOfObjectsToCSV(alarmStatsByMonth , ['Month', 'Key', 'Alarm Name', 'Recovery Time']), 'alarms-stats-by-month');
}

function getMTTR(arr){
    return arr.reduce(function (a, b) {
        return a + b;
    }) / arr.length;
}

function convertArrayOfObjectsToCSV(data, columns) {  
    var result, columnDelimiter, lineDelimiter, data;

    columnDelimiter = ',';
    lineDelimiter = '\n';

    result = '';
    result += columns.join(columnDelimiter);
    result += lineDelimiter;

    for (month in data) {
        result += month;
        result += lineDelimiter;
        for(alarm in data[month]) {
            result += '';
            result += columnDelimiter;
            result += alarm;
            result += columnDelimiter;
            for (item in data[month][alarm]){
                result += data[month][alarm][item];
                result += columnDelimiter;
            }
            result += lineDelimiter;
        }
        result += lineDelimiter;
    }
    return result;
}

function writeAlarmStatsToCSV(data, name){
    let currentDate = new Date();
    let filename = `${name}-cloudwatch-alarms-mttr-analysis-${currentDate.getFullYear()}-${monthNames[currentDate.getMonth()]}-${currentDate.getDate()}.csv`;
    
    if (fs.exists(`./${filename}`)) {
        fs.unlink(`./${filename}`, function(error) {
            if (error) {
                throw error;
            }
            console.log('recreating new report..');
        });
    }    

    fs.writeFile(filename, data, (err) => {  
        if (err) throw err;
        console.log(`${filename} generated`);
    });
}

processMessage();
