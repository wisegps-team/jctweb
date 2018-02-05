/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */

var branch_flag = 1;   //1: 新增  2: 修改
var validator_branch;
var vehicle_table;
var branch_id = "";
var branch;
var lon = parseFloat($.cookie("lon")) || 113.84714;
var lat = parseFloat($.cookie("lat")) || 22.67805;
var drawingManager;
var auth_code = $.cookie('auth_code');
var updateTime = new Date(0);
var names = [];
var vehicles = [];
var _vehicles = {};
var _devices = {};
var checkDids = ($.cookie("checkDids") || '').split("|");
var _counts;
var _firstLoad = true;
var _drawing = false;
var map_type = MAP_TYPE_BAIDU;
var map_engine = 'BAIDU';
var status_flag = '';
var uid = 0;
var is_depart = false;
var departs = {};
var dealer_id = $.cookie('dealer_id');
var dealer_type = $.cookie('dealer_type');
var login_depart_id = $.cookie('login_depart_id');

function customerQuery() {
    var dealer_type = $.cookie('dealer_type');
    // var dealer_id = $.cookie('dealer_id');
    var tree_path = $.cookie('tree_path');
    var key = '';
    if ($('#customerKey').val() !== '') {
        key = $('#customerKey').val();
    }
    var query_json;
    if (key !== "") {
        query_json = {
            treePath: '^,' + dealer_id + ',',
            name: '^' + key
        };
    } else {
        query_json = {
            // parentId: dealer_id
            treePath: '^,' + dealer_id + ','
        };
    }
    wistorm_api._list('customer', query_json, 'objectId,name,treePath,parentId,uid,custType,other', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, customerQuerySuccess)
}

var treeIcon = {
    '1': '/img/dealer_icon.png',
    '2': '/img/dealer_icon.png',
    '7': '/img/person_icon.png',
    '8': '/img/company_icon.png',
    '99': '/img/depart_icon.png'
};

var _runing = false;

var customerQuerySuccess = function (json) {
    var names = [];
    customers = json.data;
    if (json.data.length > 0) {
        // user_name = json.data[0].users[0].user_name;
        cust_name = json.data[0].name;
        cust_id = json.data[0].objectId;
        uid = json.data[0].uid;
        tree_path = json.data[0].treePath;
        // level = json.data[0].level;
    }
    if ($.cookie('uid')) {
        uid = $.cookie('uid');
        tree_path = $.cookie('tree_path');
    }

    for (var i = 0; i < json.data.length; i++) {
        names.push(json.data[i].name);
    }

    var onCustomerSelectClick = function (event, treeId, treeNode) {
//        alert(treeNode.tree_path);
//         if(!_runing){
//             _runing = true;
            if (treeNode.pId || treeNode.id == dealer_id) {
                uid = treeNode.id;
                $.cookie('uid', uid);
                cust_name = treeNode.name;
                $('#selCustName').html(cust_name);
                clearVehicles();
                vehicleQuery(treeNode.id, treeNode.isDepart);
            }
        // }
    };

    var onCustomerSelectDblClick = function (event, treeId, treeNode) {
        // var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        // if (treeNode.id !== $.cookie('dealer_id')) {
        //     loadSubNode(treeObj, treeNode);
        // }
    };

    var setting = {
        view: {showIcon: true},
        check: {enable: false, chkStyle: "checkbox"},
        data: {simpleData: {enable: true}},
        callback: {onClick: onCustomerSelectClick, onDblClick: onCustomerSelectDblClick}
    };

    var customerArray = [];
    // customerArray.push({
    //     open: true,
    //     id: $.cookie('dealer_id'),
    //     pId: 0,
    //     name: '我的车辆',
    //     icon: '/img/customer.png'
    // });
    // uid = $.cookie('dealer_id');
    //
    // if ($.cookie('dealer_type') == 1 || $.cookie('dealer_type') == 11 || $.cookie('dealer_type') == 2) {
    //     customerArray.push({
    //         open: true,
    //         id: '2',
    //         pId: 0,
    //         name: '运营商(用户/车辆)',
    //         icon: '/img/customer.png'
    //     });
    // }
    //
    // if ($.cookie('dealer_type') == 1 || $.cookie('dealer_type') == 11 || $.cookie('dealer_type') == 2 || $.cookie('dealer_type') == 8) {
    //     customerArray.push({
    //         open: false,
    //         id: '8',
    //         pId: 0,
    //         name: '集团用户(用户/车辆)',
    //         icon: '/img/customer.png'
    //     });
    //     customerArray.push({
    //         open: false,
    //         id: '7',
    //         pId: 0,
    //         name: '个人用户(用户/车辆)',
    //         icon: '/img/customer.png'
    //     });
    // }
    //
    // if ($.cookie('dealer_type') == 7) {
    //     customerArray.push({
    //         open: false,
    //         id: '7',
    //         pId: 0,
    //         name: '个人用户(用户/车辆)',
    //         icon: '/img/customer.png'
    //     });
    // }

    // 创建三个分类的根节点
    for (var i = 0; i < json.data.length; i++) {
        var childCount = json.data[i]['other'] ? (json.data[i]['other']['childCount'] || 0) : 0;
        var vehicleCount = json.data[i]['other'] ? (json.data[i]['other']['vehicleCount'] || 0) : 0;
        customerArray.push({
            open: false,
            id: json.data[i]['uid'],
            pId: json.data[i]['parentId'][0],
            name: json.data[i]['name'] + '(' + childCount + '/' + vehicleCount + ')',
            icon: treeIcon[json.data[i]['custType']]
        });
    }
    $.fn.zTree.init($("#customerTree"), setting, customerArray);

    $('#customerKey').typeahead({source: names});

    // if (uid > 0) {
    //     var treeObj = $.fn.zTree.getZTreeObj("customerTree");
    //     var node = treeObj.getNodeByParam("id", uid, null);
    //     tree_path = node.treePath;
    //     cust_name = node.name;
    //     $('#selCustName').html(cust_name);
    //     treeObj.selectNode(node);
    //     if (typeof vehicleQuery != "undefined") {
    //         vehicleQuery(uid, "");
    //     }
    // }
    if(uid > 0){
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var node = treeObj.getNodeByParam("id", uid, null);
        if(node){
            tree_path = node.treePath;
            cust_name = node.name;
            $('#selCustName').html(cust_name);
            treeObj.selectNode(node);
        }else{
            uid = $.cookie('dealer_id');
            tree_path = $.cookie('tree_path');
            node = treeObj.getNodeByParam("id", uid, null);
            tree_path = node.treePath;
            cust_name = node.name;
            $('#selCustName').html(cust_name);
            treeObj.selectNode(node);
        }
        if(typeof vehicleQuery != "undefined"){
            vehicleQuery(uid, "");
        }
    }
};

function getAllDepart() {
    // var dealer_type = $.cookie('dealer_type');
    // var dealer_id = $.cookie('dealer_id');

    var query_json = {
        uid: dealer_id
    };
    var rootArray = [];

    wistorm_api._list('department', query_json, 'objectId,name,parentId,uid', 'name', 'name', 0, 0, 1, -1, auth_code, true, function(json){
        // 创建三个分类的根节点
        for (var i = 0; i < json.data.length; i++) {
            // 如果为成员登陆，则加载本级及下级
            if(['9', '12', '13'].indexOf(dealer_type) > -1){
                if(json.data[i].objectId.toString() !== login_depart_id && json.data[i].parentId.toString() !== login_depart_id){
                    continue;
                }
            }
            departs[json.data[i].objectId.toString()] = json.data[i].name;
            var pId = dealer_id;
            if(json.data[i]['parentId'] > 0){
                pId = json.data[i]['parentId'];
            }
            rootArray.push({
                open: false,
                id: json.data[i]['objectId'],
                treePath: json.data[i]['treePath'],
                pId: pId,
                name: json.data[i]['name'],
                icon: treeIcon['99'],
                isDepart: true
            });
        }
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var root = treeObj.getNodeByParam("id", dealer_id, null);
        if(root) {
            treeObj.addNodes(root, rootArray);
        }
    });
}

// 车辆查询
function vehicleQuery(cust_id, depart) {
    // var query_json;
    // if (key && key != "") {
    //     query_json = {
    //         uid: cust_id,
    //         name: '^' + key
    //     };
    // } else {
    //     query_json = {
    //         uid: cust_id
    //     };
    // }
    // setLoading("vehicle_list");
    // wistorm_api._list('vehicle', query_json, 'objectId,name,model,did,sim,serviceRegDate,serviceExpireIn', 'name', 'name', 0, 0, 1, -1, auth_code, true, vehicleQuerySuccess)
    uid = cust_id;
    is_depart = depart;
    querySuccess();
}

// 设备查询
function deviceQuery(dids, callback) {
    var startTime = updateTime.format("yyyy-MM-dd hh:mm:ss");
    var endTime = '2100-01-01';
    // var query_json = {
    //     // did: dids,
    //     uid: uid,
    //     map: 'BAIDU',
    //     'activeGpsData.rcvTime': startTime + '@' + endTime
    // };
    if (dids !== '') {
        query_json = {
            did: dids,
            map: map_engine,
            'activeGpsData.rcvTime': startTime + '@' + endTime
        };
        wistorm_api._listPost('_iotDevice', query_json, 'did,activeGpsData,accOffTime,params,workType', '-activeGpsData.rcvTime', '-activeGpsData.rcvTime', 0, 0, 1, -1, auth_code, true, function (json) {
            if (json.data.length > 0) {
                updateTime = new Date(json.data[0].activeGpsData.rcvTime);
                updateTime.setSeconds(updateTime.getSeconds() + 1);
            }
            callback(json);
        });
    }
}

var getAcc = function (device) {
    var acc = device.activeGpsData.status.join(",").indexOf('8196') > -1 ? '启动' : '熄火';
    return acc;
};

var getSpeed = function (device) {
    var speed = (device.activeGpsData.speed || 0).toFixed(0);
    return speed;
};

var getFlag = function (device) {
    var flag = '';
    if (!device.activeGpsData || !getOnLine(device)) {
        flag = '2';
    } else if (device.activeGpsData && device.activeGpsData.alerts.length > 0) {
        flag = '3';
    } else {
        flag = '1';
    }
    return flag;
};

var getColorFlag = function (device) {
    var flag = '';
    if (!device.activeGpsData || !getOnLine(device)) {
        flag = '_offline';
    } else if (device.activeGpsData && device.activeGpsData.alerts.length > 0) {
        flag = '_alert';
    } else {
        if (device.activeGpsData.status.join(",").indexOf('8196') > -1) {
            flag = '_run';
        }
    }
    return flag;
};

var setColor = function (vehicle) {
    var obj = $('#' + vehicle.did.trim());
    if (obj.length > 0) {
        var flag = getColorFlag(vehicle);
        obj.parent().parent().removeClass('_run');
        obj.parent().parent().removeClass('_alert');
        obj.parent().parent().removeClass('_offline');
        obj.parent().parent().addClass(flag);
    }
};

var setInfo = function (vehicle) {
    _drawing = true;
    var obj = $('#' + vehicle.did.trim());
    if (obj.length > 0) {
        obj.parent().parent().find('td')[2].innerHTML = vehicle.status;
        var d = vehicle_table.api().rows(obj.parent().parent()).data()[0];
        d.flag = vehicle.flag;
        // vehicle_table.api().rows(obj.parent().parent()).data(d).draw();
        // vehicle_table.api().row(obj.parent().parent()).remove();
        // vehicle_table.api().row.add(d);
        var idx = vehicle_table.api().row(obj.parent().parent()).index();
        // vehicle_table.api().cell(idx, 3).data(vehicle.flag).draw(false);
        vehicle_table.api().cell(idx, 3).data(vehicle.flag);
    }
    // obj.parent().parent().find('td')[2].innerHTML = vehicle.acc;
    // obj.parent().parent().find('td')[3].innerHTML = vehicle.speed;
    // $('#' + vehicle.did).prop("checked", true);
    _drawing = false;
    // vehicle_table.api().row().draw();
};

// 更新各种状态的计数
var updateVehicleCount = function (callback) {
    // $('#vehicle-status li').each(function () {
    //     var _this = this;
    //     var count = vehicle_table.api().column(3).data().filter(function (value, index) {
    //         return $(_this).attr('flag') == '' || ($(_this).attr('flag') == '1' && (value == '1' || value == '3')) || value == $(_this).attr('flag');
    //     }).length;
    //     $(this).find('a')[0].innerHTML = _counts[$(this).attr('flag')] + '(' + count + ')';
    // });
    if(is_depart){
        var query = {
            uid: dealer_id,
            departId: uid.toString()
        };
    }else{
        var query = {
            uid: uid
        };
        if(['9', '12', '13'].indexOf(dealer_type) > -1){
            query['departId'] = login_depart_id;
        }
    }

    wistorm_api._count('vehicle2', query, auth_code, true, function (obj) {
        console.log(obj);
        $('#onlineStatus').find('a')[0].innerHTML = _counts['1'] + '(' + (obj.online || 0) + ')';
        $('#offlineStatus').find('a')[0].innerHTML = _counts['2'] + '(' + (obj.offline || 0) + ')';
        $('#alertStatus').find('a')[0].innerHTML = _counts['3'] + '(' + (obj.alert || 0) + ')';
        if(callback)callback();
    });
};

var getRefreshDid = function () {
    var refreshDids = [];
    if(vehicle_table){
        var start = vehicle_table.fnSettings()._iDisplayStart;
        for (var i = 0; i < 100; i++) {
            if (start + i >= vehicles.length) {
                break;
            }
            refreshDids.push(vehicles[start + i].did);
        }
    }
    return refreshDids;
};

var querySuccess = function () {
    var _columns = [
        {
            "searchable": false,
            "data": null,
            "className": "center did",
            "bSortable": false,
            "render": function (obj) {
                return "<input type='checkbox' id='" + obj.did + "' value='" + obj.did + "' title='" + i18next.t("monitor.check_refresh") + "'>";
            }
        },
        {
            "searchable": false, "data": null, "className": "", "render": function (obj) {
            return '<div style="min-width:135px;width:auto;overflow:hidden;white-space:nowrap; text-overflow:ellipsis" title="' + obj.name + '">' + obj.name + '</div>';
        }
        },
        // { "searchable": false, "data":"acc", "className":"center" },
        // { "searchable": false, "data":"speed", "className":"center" },
        {"searchable": false, "data": "status", "className": ""},
        {"searchable": false, "data": "flag", "className": "", "bVisible": false}
    ];
    var lang = i18next.language || 'en';
    var height = $(window).height() - $('#accordion2').height() - 210;
    var objTable = {
        "bDestroy": true,
        "bAutoWidth": false,
        // "sScrollX": "330px",
        "sScrollY": height + "px",
        "bInfo": false,
        "iDisplayLength": 100,
        "bLengthChange": false,
        "bProcessing": false,
        "bServerSide": true,
        "bDeferRender": false,
        "bFilter": false,
        "aoColumns": _columns,
        "sDom": "<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": {"sUrl": 'css/' + lang + '.txt'},
        "sAjaxSource": "",
        "fnServerData": retrieveData
    };
    $('#vehicleKey').typeahead({
        source: function (query, process) {
            process(names);
        }
    });

    vehicle_table = $("#vehicle_list").dataTable(objTable);
    $('#vehicle_list tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            // $(this).removeClass('selected');
        }
        else {
            vehicle_table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        var did = $(this).find(".did [type='checkbox']").val();
        if (did) {
            addVehicle(did);
            wimap.findVehicle(did, true, true);
            $('#' + did).prop("checked", true);
            if (checkDids.indexOf(did) === -1) {
                checkDids.push(did);
            }
            console.log(checkDids.join('|'));
            $.cookie('checkDids', checkDids.join('|'));
            $('#checkAll').prop("checked", checkDids.length == vehicles.length);
            if (loadIdleList) {
                if ($("#divIdle").dialog("isOpen")) {
                    idle(did, 0);
                }
            }
        }
    });
    $('#vehicle_list').on('draw.dt', function () {
        if (_drawing) {
            return;
        }
        checkAllDid();
        // updateVehicleCount();
        console.log('redraw occurred at: ' + new Date().getTime());
        $('#vehicle_list :checkbox:not(#checkAll)').unbind("change");
        $('#vehicle_list :checkbox:not(#checkAll)').change(function () {
            // alert($(this).prop("checked"));
            // alert($(this).val());
            var checked = $(this).prop("checked");
            var did = $(this).val();
            if (checked) {
                checkDids.push(did);
                addVehicle(did);
            } else {
                checkDids.pop(did);
                wimap.deleteVehicle(did);
            }
            console.log(checkDids.join('|'));
            $.cookie('checkDids', checkDids.join('|'));
            $('#checkAll').prop("checked", checkDids.length == vehicles.length);
        });
        $('#vehicle_list :checkbox:not(#checkAll)').unbind("click");
        $('#vehicle_list :checkbox:not(#checkAll)').click(function (event) {
            event.stopPropagation();
        });
        for (var i = 0; i < vehicles.length; i++) {
            setColor(vehicles[i]);
        }
    });
    // setTimeout(function () {
    //     windowResize();
    // }, 300);
};

var vehicleQuerySuccess = function (json) {
    var j, _j, UnContacter, Uncontacter_tel;
    names = [];
    var dids = [];
    vehicles = json.data;
    for (var i = 0; i < json.data.length; i++) {
        json.data[i].acc = '';
        json.data[i].speed = '';
        json.data[i].status = json.data[i].did === '' ? i18next.t("monitor.no_device") : i18next.t("monitor.no_data");
        json.data[i].flag = '';
        json.data[i].did = json.data[i].did.trim();
        names.push(json.data[i].name);
        dids.push(json.data[i].did);
        _vehicles[json.data[i].did] = json.data[i];
    }

    if (vehicles.length > 0) {
        if (intervalId) {
            clearTimeout(intervalId);
        }
        refreshLocation();
    }
    //定时更新数据
    $('#refreshText').css('display', vehicles.length > 0 ? 'block' : 'none');

    dids = dids.join('|');
    deviceQuery(dids, function (devices) {
        for (var i = 0; i < devices.data.length; i++) {
            var vehicle = _vehicles[devices.data[i].did];
            if (vehicle) {
                vehicle.acc = getAcc(devices.data[i]);
                vehicle.speed = getSpeed(devices.data[i]);
                // vehicle.status = getStatusDesc(devices.data[i], 1);
                vehicle.status = getStatus(devices.data[i]).desc;
                vehicle.flag = getFlag(devices.data[i]);
                vehicle.activeGpsData = devices.data[i].activeGpsData;
                vehicle.workType = devices.data[i].workType;
                vehicle.params = devices.data[i].params;
            }
        }
        var _columns = [
            {
                "searchable": false,
                "data": null,
                "className": "center did",
                "bSortable": false,
                "render": function (obj) {
                    return "<input type='checkbox' id='" + obj.did + "' value='" + obj.did + "' title='" + i18next.t("monitor.check_refresh") + "'>";
                }
            },
            {
                "searchable": false, "data": null, "className": "", "render": function (obj) {
                return '<div style="min-width:135px;width:auto;overflow:hidden;white-space:nowrap; text-overflow:ellipsis" title="' + obj.name + '">' + obj.name + '</div>';
            }
            },
            // { "searchable": false, "data":"acc", "className":"center" },
            // { "searchable": false, "data":"speed", "className":"center" },
            {"searchable": false, "data": "status", "className": ""},
            {"searchable": true, "data": "flag", "className": "center", 'visible': false}
        ];
        var lang = i18next.language || 'en';
        var objTable = {
            "bInfo": false,
            "bLengthChange": false,
            "bProcessing": false,
            "bServerSide": false,
            "bFilter": true,
            "scrollY": true,
            "searching": true,//本地搜索
            "data": json.data,
            "aoColumns": _columns,
            'bPaginate': true,
            "iDisplayLength": 100,
            "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": {"sUrl": 'css/' + lang + '.txt'}
        };
        $('#vehicleKey').typeahead({
            source: function (query, process) {
                process(names);
            }
        });

        if (vehicle_table) {
            vehicle_table.fnClearTable();
            if (json.data.length > 0) {
                vehicle_table.fnAddData(json.data);
            }
        } else {
            vehicle_table = $("#vehicle_list").dataTable(objTable);
            //  //添加索引列
            // vehicle_table.on('order.dt search.dt',
            //         function () {
            //         }).draw();
            $('#vehicle_list tbody').on('click', 'tr', function () {
                if ($(this).hasClass('selected')) {
                    // $(this).removeClass('selected');
                }
                else {
                    vehicle_table.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
                var did = $(this).find(".did [type='checkbox']").val();
                if (did) {
                    addVehicle(did);
                    wimap.findVehicle(did, true, true);
                    $('#' + did).prop("checked", true);
                    if (checkDids.indexOf(did) === -1) {
                        checkDids.push(did);
                    }
                    console.log(checkDids.join('|'));
                    $.cookie('checkDids', checkDids.join('|'));
                    $('#checkAll').prop("checked", checkDids.length == vehicles.length);
                    if (loadIdleList) {
                        if ($("#divIdle").dialog("isOpen")) {
                            idle(did, 0);
                        }
                    }
                }
            });
            $('#vehicle_list').on('draw.dt', function () {
                if (_drawing) {
                    return;
                }
                checkAllDid();
                // updateVehicleCount();
                console.log('redraw occurred at: ' + new Date().getTime());
                $('#vehicle_list :checkbox:not(#checkAll)').unbind("change");
                $('#vehicle_list :checkbox:not(#checkAll)').change(function () {
                    // alert($(this).prop("checked"));
                    // alert($(this).val());
                    var checked = $(this).prop("checked");
                    var did = $(this).val();
                    if (checked) {
                        checkDids.push(did);
                        addVehicle(did);
                    } else {
                        checkDids.pop(did);
                        wimap.deleteVehicle(did);
                    }
                    console.log(checkDids.join('|'));
                    $.cookie('checkDids', checkDids.join('|'));
                    $('#checkAll').prop("checked", checkDids.length == vehicles.length);
                });
                $('#vehicle_list :checkbox:not(#checkAll)').unbind("click");
                $('#vehicle_list :checkbox:not(#checkAll)').click(function (event) {
                    event.stopPropagation();
                });
                for (var i = 0; i < vehicles.length; i++) {
                    setColor(vehicles[i]);
                }
            });
        }
        // setTimeout(function () {
        //     windowResize();
        // }, 300);
        _runing = false;
    });
};

function _clearTimeout(){
    updateTime = new Date(0);
    if (intervalId) {
        clearTimeout(intervalId);
        interval = 10;
    }
    $('#refreshText').css('display', 'none');
}

function retrieveData( sSource, aoData, fnCallback ) {
    if(uid === 0){
        var json = {};
        json.aaData = [];
        fnCallback(json);
        return;
    }
    _clearTimeout();
    setLoading2($("#vehicleBody"));
    var key = $('#searchKey').val().trim();
    var query_json;
    var lookup = {
        from: "_iotdevices",
        localField: "did",
        foreignField: "did",
        as: "device"
    };

    if(is_depart){
        if (key && key != "") {
            query_json = {
                uid: dealer_id,
                departId: uid,
                name: '^' + key
            };
        } else {
            query_json = {
                uid: dealer_id,
                departId: uid
            };
        }
    }else{
        if (key && key != "") {
            query_json = {
                uid: uid,
                name: '^' + key
            };
        } else {
            query_json = {
                uid: uid
            };
        }
        if(['9', '12', '13'].indexOf(dealer_type) > -1){
            query_json['departId'] = login_depart_id;
        }
    }

    var now = new Date();
    now = new Date(now.setMinutes(now.getMinutes() - 10));
    if(status_flag === '1'){
        query_json['device.activeGpsData.rcvTime'] = now.format("yyyy-MM-dd hh:mm:ss") + '@2099-01-01';
    }else if(status_flag === '2'){
        query_json['device.activeGpsData.rcvTime'] = '1700-01-01@' + now.format("yyyy-MM-dd hh:mm:ss");
    }else if(status_flag === '3'){
        query_json['device.activeGpsData.rcvTime'] = now.format("yyyy-MM-dd hh:mm:ss") + '@2099-01-01';
        query_json['device.activeGpsData.alerts'] = '<>[]';
    }

    var page_count = aoData[4].value;
    var page_no = (aoData[3].value / page_count) + 1;
    var url = wistorm_api._lookupUrl('vehicle', lookup, query_json, 'objectId,name,model,did,sim,serviceRegDate,serviceExpireIn,device.activeGpsData,device.workType,device.params', 'name', 'name', page_no, page_count, auth_code, true);
    $.ajax( {
        "type": "GET",
        "contentType": "application/json",
        "url": url,
        "dataType": "json",
        "data": null, //以json格式传递
        "success": function(json) {
            json.sEcho = aoData[0].value;
            json.iTotalRecords = json.total;
            json.iTotalDisplayRecords = json.total;
            vehicles = json.data;
            for (var i = 0; i < json.data.length; i++) {
                var vehicle = json.data[i];
                var device = json.data[i].device[0];
                if (device) {
                    if(device.activeGpsData && device.activeGpsData.gpsTime){
                        vehicle.flag = getFlag(device);
                        vehicle.acc = getAcc(device);
                        vehicle.speed = getSpeed(device);
                        vehicle.status = getStatus(device).desc;
                        vehicle.activeGpsData = device.activeGpsData;
                    }else{
                        vehicle.status = vehicle.did === '' ? i18next.t("monitor.no_device") : i18next.t("monitor.no_data");
                        vehicle.flag = '';
                    }
                    vehicle.workType = device.workType || 0;
                    vehicle.params = device.params || {};
                } else {
                    vehicle.status = vehicle.did === '' ? i18next.t("monitor.no_device") : i18next.t("monitor.no_data");
                    vehicle.flag = '';
                }
                _vehicles[vehicle.did] = vehicle;
            }
            json.aaData = json.data;
            if(status_flag === '') {
                $('#allStatus').find('a')[0].innerHTML = _counts[''] + '(' + json.total + ')';
                // $("#vehicle_list").html('');
                fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式
                updateVehicleCount(function () {});
            }else{
                // $("#vehicle_list").html('');
                fnCallback(json);
            }
            if (vehicles.length > 0) {
                refreshLocation();
            }
            //定时更新数据
            $('#refreshText').css('display', vehicles.length > 0 ? 'block' : 'none');
            _runing = false;
        }
    });
    _runing = true;
}

function windowResize() {
    //高度变化改变(要重新计算_browserheight)
    var windowHeight = $(window).height() - 80;
    $('#map_canvas').css({"height": windowHeight + "px"});
    // 修改车辆列表高度
    var height = $(window).height() - $('#accordion2').height() - 210;
    // $('.dataTables_scrollBody').css({"height": height + "px"});
}

var addVehicle = function (did) {
    var vehicle = _vehicles[did];
    var vehicles = [vehicle];
    wimap.addVehicles(vehicles);
    // 保存默认位置
    if (vehicle.activeGpsData) {
        $.cookie('lon', vehicle.activeGpsData.lon);
        $.cookie('lat', vehicle.activeGpsData.lat);
    }
};

var addVehicles = function () {
    var checked = $('#checkAll').prop("checked");
    if (!checked) {
        wimap.clearVehicle();
    }
    var vehicles = [];
    var dids = $("[type='checkbox']:checked:not(#checkAll)");
    checkDids = [];
    for (var i = 0; i < dids.length; i++) {
        var vehicle = _vehicles[$(dids[i]).val()];
        if (vehicle) {
            vehicles.push(vehicle);
        }
        checkDids.push($(dids[i]).val());
    }
    wimap.addVehicles(vehicles, _firstLoad);
    _firstLoad = false;
    // }else{
    //     wimap.clearVehicle();
    //     checkDids = [];
    // }
    console.log(checkDids.join('|'));
    $.cookie('checkDids', checkDids.join('|'));
};

// 车辆跟踪
var trace = function (target, did) {
    var vehicle = _vehicles[did];
    if (vehicle) {
        // vehicle.if_track = !(vehicle.if_track || false);
        // vehicle.if_show_line = !(vehicle.if_show_line || false);
        // var caption = vehicle.if_track ? '取消跟踪' : '跟踪';
        // $(target).text(caption);
        window.open('/trace?did=' + did + '&name=' + vehicle.name);
    }
    console.log('trace = ' + did);
};

// 车辆回放
var playback = function (did) {
    var vehicle = _vehicles[did];
    if (vehicle) {
        window.open('/playback?did=' + did + '&name=' + vehicle.name + '&workType=' + vehicle.workType);
    }
    console.log('playback = ' + did);
};

// 围栏设置
var geofenceSet = function (did, lon, lat) {
    $.cookie('lon', lon);
    $.cookie('lat', lat);
    window.open('/geofence');
};

// 参数设置
var deviceSet = function (did) {
    var vehicle = _vehicles[did];
    if (vehicle) {
        $('#name').val(vehicle.name);
        $('#did').val(did);
        _did = did;
        $("#divDeviceSet").dialog("option", "title", i18next.t("setting.device_set"));
        $("#divDeviceSet").dialog("open");
    }
};

var refreshVehicles = function () {
    deviceQuery(getRefreshDid().join('|'), function (devices) {
        console.log("更新" + devices.total + '辆车数据。');
        var vehicles = [];
        for (var i = 0; i < devices.data.length; i++) {
            var vehicle = _vehicles[devices.data[i].did];
            if (vehicle) {
                vehicle.acc = getAcc(devices.data[i]);
                vehicle.speed = getSpeed(devices.data[i]);
                vehicle.status = getStatus(devices.data[i]).desc;
                vehicle.flag = getFlag(devices.data[i]);
                vehicle.activeGpsData = devices.data[i].activeGpsData;
                vehicle.params = devices.data[i].params;
                setInfo(vehicle);
                setColor(vehicle);
                if (checkDids.indexOf(devices.data[i].did) > -1) {
                    vehicles.push(vehicle);
                }
            }
        }
        wimap.addVehicles(vehicles, false, false, false);
        if(devices.total > 0){
            updateVehicleCount();
        }
    });
};

var clearVehicles = function () {
    $(":checkbox").attr("checked", false);
    uid = 0;
    vehicle_table.fnClearTable();
    status_flag = '';
    statusSelected.removeClass("active");
    $('#allStatus').addClass("active");
    statusSelected = $('#allStatus');
    // _clearTimeout();
    // clearTimeout(intervalId);
    // interval = 10;
    // updateTime = new Date(0);
};

var interval = 10;
var intervalId;
var refreshLocation = function () {
    $('#refreshText').html(i18next.t("monitor.refresh_after", {interval: interval}));
    if (interval == 0) {
        if (vehicles.length > 0) {
            refreshVehicles();
        }
        interval = 10;
    } else {
        interval--;
    }
    intervalId = setTimeout('refreshLocation()', 1000);
};

var checkAllDid = function () {
    for (var i = 0; i < checkDids.length; i++) {
        $("#" + checkDids[i]).prop("checked", true);//全选
    }
    $('#checkAll').prop("checked", checkDids.length == vehicles.length);
    addVehicles();
};


var statusSelected;
var collapsed = false;
$(document).ready(function () {
    $("#alert").hide();

    map_type = $.cookie('lang') === 'zh' || $.cookie('lang') === 'zh-CN' ? MAP_TYPE_BAIDU : MAP_TYPE_GOOGLE;
    map_engine = $.cookie('lang') === 'zh' || $.cookie('lang') === 'zh-CN' ? 'BAIDU' : 'GOOGLE';

    windowResize();

    var mtId = setInterval(function () {
        if (!i18nextLoaded) {
            return;
        }

        statusSelected = $('#allStatus');

        $("#customerKey").click(function (event) {
            // event.stopPropagation();
        });

        $('#customerKey').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                var treeObj = $.fn.zTree.getZTreeObj("customerTree");
                var node = treeObj.getNodeByParam("name", $('#customerKey').val(), null);
                if (node) {
                    treeObj.selectNode(node);
                    clearVehicles();
                    vehicleQuery(node.id, '');
                    collapsed = false;
                    // alert(collapsed);
                    if (!collapsed) {
                        $('#collapseOne').addClass("in");
                        $('#accordion-icon').removeClass("icon-arrow-down");
                        $('#accordion-icon').addClass("icon-arrow-up");
                    }
                }
                return false;
            }
        });

        $("#checkAll").click(function () {
            $("[type='checkbox']").prop("checked", $('#checkAll').prop("checked"));//全选
            _firstLoad = true;
            // if(intervalId){
            //     clearTimeout(intervalId);
            // }
            addVehicles();
        });

        $(document).on("click", "#vehicle-status li", function () {
            statusSelected.removeClass("active");
            $(this).addClass("active");
            statusSelected = $(this);
            status_flag = $(this).attr('flag') === '' ? '' : $(this).attr('flag');
            // var regex = status_flag === '[1]' ? '[13]' : status_flag;
            // console.log(regex);
            // vehicle_table.api().search(regex, true).draw();
            vehicle_table.api().draw();
        });

        $('#accordion-icon').click(function () {
            // alert("accordion-toggle");
            collapsed = !collapsed;
            // alert(collapsed);
            if (collapsed) {
                $('#collapseOne').removeClass("in");
                $('#accordion-icon').removeClass("icon-arrow-up");
                $('#accordion-icon').addClass("icon-arrow-down");
            } else {
                $('#collapseOne').addClass("in");
                $('#accordion-icon').removeClass("icon-arrow-down");
                $('#accordion-icon').addClass("icon-arrow-up");
            }
            setTimeout(function () {
                windowResize();
            }, 300)
        });

        var center_point = {lon: lon, lat: lat};
        wimap = new wiseMap(map_type, document.getElementById('map_canvas'), center_point, 15);

        //创建检索控件
        // var searchControl = new BMapLib.SearchControl({
        //     container: "searchBox", //存放控件的容器
        //     map: wimap.map,  //关联地图对象
        //     type: LOCAL_SEARCH  //检索类型
        // });

        //浏览器高度变化菜单栏对应改变
        // var map_canvas = $("#map_canvas");
        // var canvasHeight;
        // canvasHeight = $(window).height() - 80;
        // //刷新设置css
        // map_canvas.css({"height": canvasHeight + "px"});
        windowResize();
        //高度变化改变(要重新计算_browserheight)
        $(window).resize(function () {
            // canvasHeight = $(window).height() - 80;
            // map_canvas.css({"height": canvasHeight + "px"});
            windowResize();
        });

        $('#customerKey').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                customerQuery();
                return false;
            }
        });

        $('#searchKey').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                var key = '';
                if ($('#searchKey').val() !== '') {
                    key = $('#searchKey').val();
                }
                clearVehicles();
                vehicleQuery(uid, key);
                return false;
            }
        });

        _counts = {
            '': i18next.t("monitor.all_status"),
            '1': i18next.t("monitor.online_status"),
            '2': i18next.t("monitor.offline_status"),
            '3': i18next.t("monitor.alert_status")
        };

        customerQuery();
        getAllDepart();
        clearInterval(mtId);
    }, 100);
});


