/**
 * Created with JetBrains WebStorm.
 * User: Tom
 * Date: 17-12-06
 * Time: 下午11:33
 * 总览页面js
 */
//
var auth_code = $.cookie('auth_code');
var userid = $.cookie('username');
var _user = {};
var dealer_id = $.cookie('dealer_id');
var dealer_type = $.cookie('dealer_type');
var login_depart_id = $.cookie('login_depart_id');
var tree_path = $.cookie('tree_path');
var statChart;
var onlineChart;
var statusChart;

$(document).ready(function () {
    var height = $(window).height() - 80;
    $('#appArea').css({ "height": height + "px" });
    // windowResize();
    // $(window).resize(function () {
    //     windowResize();
    // });
    $(window).resize(function () {
        var height = $(window).height() - 80;
        $('#appArea').css({ "height": height + "px" });
        statChart.resize();
        onlineChart.resize();
        statusChart.resize();
    });
    getUser();
    var id = setInterval(function () {
        if (!i18nextLoaded) {
            return;
        }
        loadCounter();
        loadStatChart();
        loadOnlineChart();
        loadStatusChart();
        // vehicleWarn();
        clearInterval(id);
    }, 100);
});


function getUser() {
    wistorm_api.getUserList({ username: userid }, '', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json) {
        // debugger;
        if (json.data[0]) {
            _user.user = json.data[0];
            wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (emp) {
                _user.employee = emp.data[0];
                if (emp.data[0]) {
                    if (emp.data[0].roleId) {
                        wistorm_api._list('role', { objectId: emp.data[0].roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), false, function (roles) {
                            // console.log(roles)
                            _user.employee.rolename = roles.data[0] ? roles.data[0].name : null;
                            wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (dep) {
                                _user.depart = dep.data[0];
                                // debugger;
                                mainContral(_user)
                            })
                        })
                    } else {
                        wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                            _user.depart = dep.data[0];
                            mainContral(_user)
                        })
                    }
                } else {
                    mainContral(_user)
                }
            })
        }
    })
}

function mainContral(user) {
    console.log(user);
    sessionStorage.setItem('user', JSON.stringify(user))
    var app_json1 = { sp_status: 1 };
    var app_json2 = { STATE: 1 };
    // var isSend = false;
    // { sp_status: 1, estatus: 4 }
    // { sp_status: 1, estatus: 6 }
    // { sp_status: 5, estatus: '8|9' }
    if (user.employee) {
        if (user.employee.role == 12) {
            app_json1.depart = user.employee.departId;
            app_json1.estatus = 2;
            app_json2.DEPT = user.employee.departId;
            app_json2.DQLC = 2;
            if (user.employee.departId == 58) {
                app_json1 = { sp_status: 5, estatus: '8|9' };
            }
            if (user.employee.rolename == '警务保障室领导') {
                app_json1.estatus = 4;
                app_json2.DQLC = 4;
            }
        } else if (user.employee.role == 13 && user.depart.objectId == 1) {
            app_json1.estatus = 6;
            app_json2.DQLC = 6;
        }
        if (user.employee.rolename == '财务') {
            app_json2.STATE = 5
            app_json2.DQLC = 0;
        }
        if (user.employee.isInCharge) {
            app_json2.DQLC = 3;
        }
    } else {
        app_json1 = { sp_status: '1|5', estatus: '2|4|6|8|9' }
        app_json2 = { STATE: '1|5', DQLC: '2|3|4|6|0' }
    }
    useApp(app_json1)
    repairApp(app_json2)
    vehicleWarm()
}


function repairApp(json) {
    // debugger;
    W.$ajax('mysql_api/list', {
        json_p: json,
        table: 'ga_apply2',
        sorts: '-SQSJ'
    }, function (res) {
        console.log(res)
        $('#fixcar').empty();
        if (res.data.length) {
            res.data.forEach(ele => {
                var _href = './repaircar_detail?applyid=' + ele.XLH;
                if (ele.DQLC == 0) {
                    _href += '&reimburse=true'
                } else {
                    _href += '&auditing=true'
                }
                var tr = `<div style="font-size:12px"><a href=${_href}>${ele.SQR}的车修申请</a></div>`;
                $('#fixcar').append(tr)
            })
        } else {
            $('#fixcar').append('<p style="color:#ccc;text-align:center">今天暂无待办事项</p>')
        }
    })
}

function useApp(json) {
    W.$ajax('mysql_api/list', {
        json_p: json,
        table: 'ga_apply',
        sorts: 'cre_tm'
    }, function (res) {
        console.log(res, 'useAppjs');
        $('#usecar').empty();
        if (res.data.length) {
            res.data.forEach(ele => {
                var _href = './usecar_detail?applyid=' + ele.id;
                if (ele.estatus == 8 || ele.estatus == 9) {
                    _href += '&vehicleManage=true'
                } else {
                    _href += '&auditing=true'
                }
                var tr = `<div style="font-size:12px"><a href=${_href}>${ele.name}的用车申请</a></div>`;
                $('#usecar').append(tr)
            })
        } else {
            $('#usecar').append('<p style="color:#ccc;text-align:center">今天暂无待办事项</p>')
        }

    })
}


// //车务提醒
// var vehicleWarn = function () {
//     var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: dealer_id, departId: login_depart_id } : { uid: dealer_id };
//     // var obj = {}
//     wistorm_api._list('vehicle', query, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (veh) {
//         // console.log(veh)
//         // var maintain = veh.data.filter(ele => ele.maintainExpireIn);
//         // var insurance = veh.data.filter(ele => ele.insuranceExpireIn);
//         // var inspect = veh.data.filter(ele => ele.inspectExpireIn);

//         //保养时间
//         var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
//         wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
//             console.log(obj);
//         });
//         //保养里程
//         var query_json = { 'uid': '772634319528267800', '$where': 'this.mileage > this.maintainMileage' };
//         wistorm_api._list("vehicle", query_json, "uid,name,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
//             console.log(obj);
//         });
//         //保险时间
//         var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
//         wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
//             console.log(obj);
//         });
//         //年检到期时间
//         var nj = 'this.maintainExpireIn < ISODate("2018-01-20")'
//         var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
//         wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
//             console.log(obj);
//         });



//         // console.log(maintain, insurance, inspect)


//         // veh = veh.filter
//         // veh.filter(ele => ele.maintainExpireIn)
//     })

//     function oneLast() {
//         var year = new Date().getFullYear();
//         var month = new Date().getMonth() - 1;
//         var date = new Date().getDate();
//         if (month == -1) {
//             month = 12;
//             year = year - 1;
//         }
//         var dateStr = [year, month, date];
//         return dateStr.join('-');
//     }
// }
function vehicleWarm() {
    $('#vehicle_warn').empty();
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: dealer_id, departId: login_depart_id } : { uid: dealer_id };
    // $('#vehicle_warn').append('<p style="color:#ccc;text-align:center">今天暂无待办事项</p>')
    // var tr = '<div style="font-size:12px"><span >浙C3301警</span><span style="margin-left:20px;color:red">距离保养到期还有3天</span></div>'
    //保养时间oneLast()
    console.log(oneLast())
    var maintainExpireIn = 'this.maintainExpireIn < ISODate("' + oneLast() + '")';
    var main_json = Object.assign(query, { '$where': maintainExpireIn })
    wistorm_api._list("vehicle", main_json, "", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), true, function (obj) {
        console.log(obj, 'main_json');
        obj.data.forEach(ele => {
            // var days = new Date(new Date(ele.maintainExpireIn.slice(0,ele.maintainExpireIn.indexOf('T'))).format('yyyy-MM-dd'))
            var mainTime = new Date(new Date(ele.maintainExpireIn.slice(0, ele.maintainExpireIn.indexOf('T'))).format('yyyy-MM-dd')).getTime();
            var nowTime = new Date(new Date().format('yyyy-MM-dd')).getTime();
            var days = (mainTime - nowTime) / 1000 / 24 / 3600;
            console.log(mainTime, nowTime, days)
            var color = 'green';
            var text = `距离保养到期还有${days}天`;
            if (days <= 3) {
                color = 'red';
                if (days < 0) {
                    color = "#ab1010";
                    text = `保养已过期${Math.abs(days)}天`;
                }
            } else if (days <= 15) {
                color = '#fec941'
            }

            var tr = `<div style="font-size:12px"><span >${ele.name}</span><span style="margin-left:20px;color:${color}">${text}</span></div>`
            $('#vehicle_warn').append(tr)
        })

    });
    //保养里程
    var mile_json = Object.assign(query, { '$where': 'this.mileage > this.maintainMileage-100' })
    wistorm_api._list("vehicle", mile_json, "", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), true, function (obj) {
        console.log(obj, 'mile_json');
        obj.data.forEach(ele => {
            // var mainTime = new Date(new Date(ele.insuranceExpireIn.slice(0, ele.insuranceExpireIn.indexOf('T'))).format('yyyy-MM-dd')).getTime();
            // var nowTime = new Date(new Date().format('yyyy-MM-dd')).getTime();
            // var days = (mainTime - nowTime) / 1000 / 24 / 3600;
            // console.log(mainTime, nowTime, days)
            var mile = ''
            var color = 'green';
            var text = `距离保养里程还有${mile}公里`;
            if (mile <= 30) {
                color = 'red';
                if (mile < 0) {
                    color = "#ab1010";
                    text = `保养里程已超出${Math.abs(mile)}公里`;
                }
            } else if (mile <= 100) {
                color = '#fec941'
            }

            var tr = `<div style="font-size:12px"><span >${ele.name}</span><span style="margin-left:20px;color:${color}">${text}</span></div>`
            $('#vehicle_warn').append(tr)
        })

    });
    //保险时间
    var insuranceExpireIn = 'this.insuranceExpireIn < ISODate("' + oneLast() + '")';
    var insurance_json = Object.assign(query, { '$where': insuranceExpireIn })
    wistorm_api._list("vehicle", insurance_json, "", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), true, function (obj) {
        console.log(obj, 'insuranceExpireIn');
        obj.data.forEach(ele => {
            var mainTime = new Date(new Date(ele.insuranceExpireIn.slice(0, ele.insuranceExpireIn.indexOf('T'))).format('yyyy-MM-dd')).getTime();
            var nowTime = new Date(new Date().format('yyyy-MM-dd')).getTime();
            var days = (mainTime - nowTime) / 1000 / 24 / 3600;
            console.log(mainTime, nowTime, days)

            var color = 'green';
            var text = `距离保险到期还有${days}天`;
            if (days <= 3) {
                color = 'red';
                if (days < 0) {
                    color = "#ab1010";
                    text = `保险已过期${Math.abs(days)}天`;
                }
            } else if (days <= 15) {
                color = '#fec941'
            }

            var tr = `<div style="font-size:12px"><span >${ele.name}</span><span style="margin-left:20px;color:${color}">${text}</span></div>`
            $('#vehicle_warn').append(tr)
        })

    });
    //年检到期时间
    var inspectExpireIn = 'this.inspectExpireIn < ISODate("' + oneLast() + '")';
    var inspect_json = Object.assign(query, { '$where': inspectExpireIn })
    wistorm_api._list("vehicle", inspect_json, "", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), true, function (obj) {
        console.log(obj, 'inspectExpireIn');
        obj.data.forEach(ele => {
            var mainTime = new Date(new Date(ele.inspectExpireIn.slice(0, ele.inspectExpireIn.indexOf('T'))).format('yyyy-MM-dd')).getTime();
            var nowTime = new Date(new Date().format('yyyy-MM-dd')).getTime();
            var days = (mainTime - nowTime) / 1000 / 24 / 3600;
            console.log(mainTime, nowTime, days)
            var color = 'green';
            var text = `距离年检到期还有${days}天`;
            if (days <= 3) {
                color = 'red';
                if (days < 0) {
                    color = "#ab1010";
                    text = `年检已过期${Math.abs(days)}天`;
                }
            } else if (days <= 15) {
                color = '#fec941'
            }

            var tr = `<div style="font-size:12px"><span >${ele.name}</span><span style="margin-left:20px;color:${color}">${text}</span></div>`
            $('#vehicle_warn').append(tr)
        })
    })

}
function oneLast() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 2;
    var date = new Date().getDate();
    if (month == 12) {
        month = '01';
        year = year + 1;
    } else if (month < 10) {
        month = '0' + month;
    }
    var dateStr = [year, month, date];
    return dateStr.join('-');
}

// 加载计数
var loadCounter = function () {
    // 客户数
    var query = { treePath: '^' + tree_path };
    wistorm_api._count('customer', query, auth_code, true, function (json) {
        $('#customerCounter').html((json.count - 1) || 0);
    });
    // 部门数
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: dealer_id, parentId: login_depart_id } : { uid: dealer_id };
    wistorm_api._count('department', query, auth_code, true, function (json) {
        $('#departCounter').html(json.count || 0);
    });
    // 成员数
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { companyId: dealer_id, departId: login_depart_id } : { companyId: dealer_id };
    wistorm_api._count('employee', query, auth_code, true, function (json) {
        $('#employeeCounter').html(json.count || 0);
    });
    // 车辆数
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: dealer_id, departId: login_depart_id } : { uid: dealer_id };
    wistorm_api._count('vehicle', query, auth_code, true, function (json) {
        $('#vehicleCounter').html(json.count || 0);
    });
    // 设备数
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: 'none' } : { uid: dealer_id };
    wistorm_api._count('_iotDevice', query, auth_code, true, function (json) {
        $('#deviceCounter').html(json.count || 0);
    });
};

// 加载车辆状态曲线
/**
 * @param {[*]} dateArray
 */
var drawStatChart = function (dateArray, mileArray, fuelArray) {
    // 基于准备好的dom，初始化echarts实例
    statChart = echarts.init(document.getElementById('stat'));

    // 指定图表的配置项和数据
    var option = {
        backgroundColor: '#fff',
        color: ['#5793f3', '#d14a61'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#0D4286'
                }
            }
        },
        toolbox: {
            show: true,
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        legend: {
            left: 'center',
            data: ['日统计里程', '日统计油耗'],
            textStyle: {
                color: "#000",
                fontsize: 5
            }
        },
        // dataZoom: [{
        //     show: false,
        //     realtime: true,
        //     start: 0,
        //     end: 5,
        //     // backgroundColor:'#d'
        //     textStyle: {
        //         color: "#000"
        //     }
        // }, {
        //     type: 'inside',
        //     realtime: true,
        //     start: 5,
        //     end: 85
        // }],
        grid: {
            show: true,
            top: '24%',
            left: '2%',
            right: '1%',
            bottom: '14%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#000'
                }
            },
            axisLabel: { //调整x轴的lable
                textStyle: {
                    color: '#000'
                }
            },
            splitLine: {
                show: true
            },
            data: dateArray
        },
        yAxis: [{
            boundaryGap: [0, '50%'],
            axisLine: {
                lineStyle: {
                    color: '#000'
                }
            },
            type: 'value',
            name: '里程(km)',
            position: 'left',
            offset: 0,
            splitNumber: 10,
            axisLabel: {
                formatter: '{value}',
                textStyle: {
                    color: '#000'
                }
            },
            splitLine: {
                show: false
            }
        }, {
            boundaryGap: [0, '50%'],
            axisLine: {
                lineStyle: {
                    color: '#000'
                }
            },
            splitLine: {
                show: false
            },
            type: 'value',
            name: '油耗(L)',
            position: 'right',
            axisLabel: {
                formatter: '{value}'
            }
        }],
        series: [{
            name: '日统计里程',
            type: 'line',
            // step: 'middle',
            smooth: true,
            data: mileArray,
            yAxisIndex: 0
        }, {
            name: '日统计油耗',
            type: 'line',
            // step: 'start',
            smooth: true,
            data: fuelArray,
            yAxisIndex: 1
        }]
    };

    // 使用刚指定的配置项和数据显示图表。
    statChart.setOption(option);
};
var getTripData = function (query_json) {
    var group = {
        _id: { year: "$year", month: "$month", day: "$day" },
        distance: { $sum: "$distance" },
        fuel: { $sum: "$fuel" }
    };
    var sorts = '_id.year,_id.month,_id.day';

    wistorm_api._aggr("_iotTrip", query_json, group, sorts, auth_code, function (obj) {
        console.log(JSON.stringify(obj));
        if (obj.status_code === 0) {
            var dateArray = [];
            var mileArray = [];
            var fuelArray = [];
            for (var i = 0; i < obj.data.length; i++) {
                dateArray.push(obj.data[i]._id.year + '-' + obj.data[i]._id.month + '-' + obj.data[i]._id.day);
                mileArray.push(obj.data[i].distance.toFixed(1));
                fuelArray.push(obj.data[i].fuel.toFixed(1));
            }
            drawStatChart(dateArray, mileArray, fuelArray);
        }
    });
};
var loadStatChart = function () {
    var endTime = new Date();
    endTime.setDate(endTime.getDate() - 1);
    var startTime = new Date();
    startTime.setMonth(endTime.getMonth() - 1);
    if (['9', '12'].indexOf(dealer_type) > -1) {
        var query = { uid: dealer_id, departId: login_depart_id };
        wistorm_api._list('vehicle', query, 'did', 'did', 'did', 0, 0, 1, -1, auth_code, true, function (vehicles) {
            var dids = [];
            for (var i = 0; i < vehicles.total; i++) {
                if (vehicles.data[i].did !== '') {
                    dids.push(vehicles.data[i].did);
                }
            }
            var query_json = {
                did: dids.join("|"),
                endTime: startTime.format("yyyy-MM-dd") + "@" + endTime.format("yyyy-MM-dd") + ' 23:59:59'
            };
            getTripData(query_json);
        });
    } else {
        var query_json = {
            uid: dealer_id.toString(),
            endTime: startTime.format("yyyy-MM-dd") + "@" + endTime.format("yyyy-MM-dd") + ' 23:59:59'
        };
        getTripData(query_json);
    }
};

// 加载车辆上线拼图
/**
 * @param {[*]} dataArray
 */
var drawOnlineChart = function (dataArray) {
    dataArray = dataArray || [
        { value: 10, name: '在线' },
        { value: 200, name: '离线' },
        { value: 9, name: '报警' }
    ];
    // 基于准备好的dom，初始化echarts实例
    onlineChart = echarts.init(document.getElementById('online'));

    // 指定图表的配置项和数据
    var option = {
        // title: {
        //     text: '上线统计',
        //     left: 'center'
        // },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            // orient: 'vertical',
            // top: 'middle',
            bottom: 10,
            left: 'center',
            data: ['在线', '报警', '离线']
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                data: dataArray,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    onlineChart.setOption(option);
};
var loadOnlineChart = function () {
    var query = {
        uid: dealer_id
    };
    if (['9', '12'].indexOf(dealer_type) > -1) {
        query['departId'] = login_depart_id;
    }

    wistorm_api._count('vehicle2', query, auth_code, true, function (obj) {
        console.log(obj);
        drawOnlineChart([
            { value: obj.online || 0, name: '在线' },
            { value: obj.offline || 0, name: '离线' },
            { value: obj.alert || 0, name: '报警' }
        ]);
    });
};

// 加载车辆上线拼图
/**
 * @param {[*]} dataArray
 */
var drawStatusChart = function (dataArray) {
    dataArray = dataArray || [
        { value: 1548, name: '空闲' },
        { value: 535, name: '出车' },
        { value: 535, name: '维保' }
    ];
    // 基于准备好的dom，初始化echarts实例
    statusChart = echarts.init(document.getElementById('status'));

    // 指定图表的配置项和数据
    var option = {
        // title: {
        //     text: '车辆总数：221',
        //     left: 'center'
        // },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            // orient: 'vertical',
            // top: 'middle',
            bottom: 10,
            left: 'center',
            data: ['空闲', '出车', '维保']
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                data: dataArray,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    statusChart.setOption(option);
};
var loadStatusChart = function () {
    var query = {
        uid: dealer_id
    };
    if (['9', '12', '13'].indexOf(dealer_type) > -1) {
        query['departId'] = login_depart_id;
    }
    var group = {
        _id: { status: "$status" },
        total: { $sum: 1 }
    };
    var sorts = '_id.status';

    wistorm_api._aggr("vehicle", query, group, sorts, auth_code, function (obj) {
        console.log(JSON.stringify(obj));
        var free = 0;
        var used = 0;
        var maintain = 0;
        if (obj.status_code === 0) {
            for (var i = 0; i < obj.data.length; i++) {
                if (obj.data[i]._id.status === 0) {
                    free = obj.data[i].total;
                } else if (obj.data[i]._id.status === 1) {
                    used = obj.data[i].total;
                } if (obj.data[i]._id.status === 2) {
                    maintain = obj.data[i].total;
                }
            }
            var dataArray = [
                { value: free, name: '空闲' },
                { value: used, name: '出车' },
                { value: maintain, name: '维保' }
            ];
            drawStatusChart(dataArray);
        }
    });

};


//车务提醒
var vehicleWarn = function () {
    var query = ['9', '12'].indexOf(dealer_type) > -1 ? { uid: dealer_id, departId: login_depart_id } : { uid: dealer_id };
    // var obj = {}
    wistorm_api._list('vehicle', query, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (veh) {
        // console.log(veh)
        // var maintain = veh.data.filter(ele => ele.maintainExpireIn);
        // var insurance = veh.data.filter(ele => ele.insuranceExpireIn);
        // var inspect = veh.data.filter(ele => ele.inspectExpireIn);

        //保养时间
        var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
        wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
            console.log(obj);
        });
        //保养里程
        var query_json = { 'uid': '772634319528267800', '$where': 'this.mileage > this.maintainMileage' };
        wistorm_api._list("vehicle", query_json, "uid,name,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
            console.log(obj);
        });
        //保险时间
        var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
        wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
            console.log(obj);
        });
        //年检到期时间
        var nj = 'this.maintainExpireIn < ISODate("2018-01-20")'
        var query_json = { uid: '937849073803857900', '$where': 'this.maintainExpireIn < ISODate("2018-01-20")' };
        wistorm_api._list("vehicle", query_json, "uid,name,maintainExpireIn,mileage,maintainMileage", "objectId", "objectId", 0, 0, 1, -1, $.cookie('auth_code'), function (obj) {
            console.log(obj);
        });



        // console.log(maintain, insurance, inspect)


        // veh = veh.filter
        // veh.filter(ele => ele.maintainExpireIn)
    })

    function oneLast() {
        var year = new Date().getFullYear();
        var month = new Date().getMonth() - 1;
        var date = new Date().getDate();
        if (month == -1) {
            month = 12;
            year = year - 1;
        }
        var dateStr = [year, month, date];
        return dateStr.join('-');
    }
}