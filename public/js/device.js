/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */
var auth_code = $.cookie('auth_code');
var _table;
var _validator;
var cust_id = 0;
var uid = 0;
var assignUid = 0;
var assignName = '';
var assignTreePath = '';
var obj_id = 0;
var did = '';
var dealer_type = $.cookie('dealer_type');
var login_depart_id = $.cookie('depart_id');

function windowResize() {
    var height = $(window).height() - 122;
    $('#customerTree').css({"height": height + "px"});
};

// 客户详细信息
function deviceInfo(did){
    // var auth_code = $.cookie('auth_code');
    // var searchUrl = $.cookie('Host') + "vehicle/" + obj_id;
    // var searchData = { auth_code:auth_code };
    // var searchObj = { type:"GET", url:searchUrl, data:searchData, success:function (json) {
    //     vehicleInfoSuccess(json);
    // }, error:OnError };
    // ajax_function(searchObj);
    var query_json = {
        did: did
    };
    wistorm_api._get('_iotDevice', query_json, 'objectId,did,model,workType,vehicleId,vehicleName', auth_code, true, function(json){
        deviceInfoSuccess(json.data);
    });
}

function vehicleDeviceList(){
    $("#divDeviceAssign").dialog("open");
}

// 跳转到日志页面
function logInfo(device_id){
    var logUrl = "/datalog?device_id=" + device_id;
    window.location.href = logUrl;
}

var deviceInfoSuccess = function(json) {
    //alert(json);
    // validator_vehicle.resetForm();
    var title = i18next.t("device.edit_device",{cust_name: cust_name});
    initFrmDevice(title, 2, json.did, json.model, json.workType, json.vehicleId, json.vehicleName);
    $("#divDeviceEdit").dialog("open");
};

// 初始化车辆信息窗体
var initFrmDevice = function(title, flag, did, model, workType, vehicleId, vehicleName){
    $("#divDeviceEdit").dialog("option", "title", title);
    _flag = flag;
    $('#editDid').val(did);
    $('#editModel').val(model);
    $('#editWorkType').val((workType||0).toString());
    $('#editVehicleName').val(vehicleName||'');
    $('#unbind').css("display", vehicleName||'' !== '' ? 'inline-block': 'none');
};

var initFrmCustomerList = function(title, obj_id, obj_name, cust_id){
    $("#divCustomerList").dialog("option", "title", title);
    $('#change_obj_id').val(obj_id);
    $('#change_obj_name').val(obj_name);
    $('#change_cust_id').html("");
    for(var i = 0; i < customers.length; i++){
        $('#change_cust_id').append("<option value='"+customers[i].cust_id+"'>"+customers[i].cust_name+"</option>");
    }
    $("#change_cust_id").get(0).value = cust_id;
};

function customerQuery() {
    var dealer_type = $.cookie('dealer_type');
    var dealer_id = $.cookie('dealer_id');
    var tree_path = $.cookie('tree_path');
    var key = '';
    if($('#searchKey').val() !== ''){
        key = $('#searchKey').val().trim();
    }

    var query_json;
    if(key !== ""){
        query_json = {
            treePath: '^,' + dealer_id + ',',
            name: '^' + key
        };
    }else{
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
    '8': '/img/company_icon.png'
};

var customerQuerySuccess = function(json) {
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

    var onCustomerSelectClick = function(event, treeId, treeNode){
//        alert(treeNode.tree_path);
        if(treeNode.pId || treeNode.id == $.cookie('dealer_id')){
            uid = treeNode.id;
            tree_path = treeNode.treePath;
            cust_id = treeNode.id;
            $.cookie('uid', uid);
            cust_name = treeNode.name;
            $('#selCustName').html(cust_name);
            _query(treeNode.id, '');
        }
    };

    var onCustomerAssignClick = function(event, treeId, treeNode){
//        alert(treeNode.tree_path);
        if(treeNode.pId){
            assignUid = treeNode.id;
            assignTreePath = treeNode.treePath;
            assignName = treeNode.name;
        }
    };

    var onCustomerSelectDblClick = function(event, treeId, treeNode){
        // var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        // if(treeNode.id !== $.cookie('dealer_id')){
        //     loadSubNode(treeObj, treeNode);
        // }
    };

    var onCustomerAssignDblClick = function(event, treeId, treeNode){
        // var treeObj = $.fn.zTree.getZTreeObj("customerTreeAssign");
        // loadSubNode(treeObj, treeNode);
    };

    var setting = {
        view: {showIcon: true},
        check: {enable: false, chkStyle: "checkbox"},
        data: {simpleData: {enable: true}},
        callback: {onClick: onCustomerSelectClick, onDblClick: onCustomerSelectDblClick}
    };
    var settingAssign = {
        view: {showIcon: true},
        check: {enable: false, chkStyle: "checkbox"},
        data: {simpleData: {enable: true}},
        callback: {onClick: onCustomerAssignClick, onDblClick: onCustomerAssignDblClick}
    };

    var customerArray = [];
    var selectArray = [];
    // uid = $.cookie('dealer_id');
    // customerArray.push({
    //     open: false,
    //     id: uid,
    //     pId: 0,
    //     name: '我的终端',
    //     icon: '/img/customer.png'
    // });

    // if($("#__customer").length > 0){
        // if($.cookie('dealer_type') == 1 || $.cookie('dealer_type') == 11 || $.cookie('dealer_type') == 2){
        //     customerArray.push({
        //         open: true,
        //         id: '2',
        //         pId: 0,
        //         name: '运营商(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        //     selectArray.push({
        //         open: true,
        //         id: '2',
        //         pId: 0,
        //         name: '运营商(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        // }
        //
        // if($.cookie('dealer_type') == 1 || $.cookie('dealer_type') == 11 || $.cookie('dealer_type') == 2 || $.cookie('dealer_type') == 8) {
        //     customerArray.push({
        //         open: false,
        //         id: '8',
        //         pId: 0,
        //         name: '集团用户(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        //     selectArray.push({
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
        //     selectArray.push({
        //         open: false,
        //         id: '7',
        //         pId: 0,
        //         name: '个人用户(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        // }
        //
        // if($.cookie('dealer_type') == 7) {
        //     customerArray.push({
        //         open: false,
        //         id: '7',
        //         pId: 0,
        //         name: '个人用户(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        //     selectArray.push({
        //         open: false,
        //         id: '7',
        //         pId: 0,
        //         name: '个人用户(用户/车辆)',
        //         icon: '/img/customer.png'
        //     });
        // }

        // 创建三个分类的根节点
        for (var i = 0; i < json.data.length; i++) {
            var childCount = json.data[i]['other'] ? (json.data[i]['other']['childCount'] || 0): 0;
            var vehicleCount = json.data[i]['other'] ? (json.data[i]['other']['vehicleCount'] || 0): 0;
            customerArray.push({
                open: false,
                id: json.data[i]['uid'],
                treePath: json.data[i]['treePath'],
                pId: json.data[i]['parentId'][0],
                name: json.data[i]['name'] + '(' + childCount + '/' + vehicleCount + ')',
                icon: treeIcon[json.data[i]['custType']]
            });
            selectArray.push({
                open: false,
                id: json.data[i]['uid'],
                treePath: json.data[i]['treePath'],
                pId: json.data[i]['parentId'][0],
                name: json.data[i]['name'] + '(' + childCount + '/' + vehicleCount + ')',
                icon: treeIcon[json.data[i]['custType']]
            });
        }
    // }

    $.fn.zTree.init($("#customerTree"), setting, customerArray);
    $.fn.zTree.init($("#customerTreeAssign"), settingAssign, selectArray);

    $('#customerKey').typeahead({source:names});

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
        if(typeof _query != "undefined"){
            _query(uid, "");
        }
    }
};

// 终端查询
function _query(cust_id) {
    var key = '';
    if($("#deviceKey").val() !== ''){
        key = $("#deviceKey").val().trim();
    }

    var query_json;
    if(key !== ""){
        query_json = {
            uid: cust_id,
            did: '^' + key
        };
    }else{
        query_json = {
            uid: cust_id
        };
    }
    // setLoading("vehicle_list");
    // var url = wistorm_api._listUrl('_iotDevice', query_json, 'objectId,model,did,params,activeGpsData,createdAt', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, true);
    // querySuccess(url);
    querySuccess();
}

var names = [];

function retrieveData( sSource, aoData, fnCallback ) {
    var key = $('#deviceKey').val().trim();
    var query_json;
    if(key != ""){
        var searchType = $('#searchType').val();
        if($('#allNode').is(':checked')) {
            query_json = {
                treePath: '^' + tree_path
            };
            wistorm_api._list('customer', query_json, 'uid', 'uid', '-createdAt', 0, 0, 1, -1, auth_code, true, function (json) {
                var uids = [];
                uids.push(uid.toString());
                for (var i = 0; i < json.data.length; i++) {
                    uids.push(json.data[i].uid);
                }
                query_json = {
                    uid: uids.join('|'),
                    map: 'BAIDU'
                };
                if(searchType === 'params.iccid'){
                    query_json[searchType] = '^' + key.toLowerCase();
                }else{
                    query_json[searchType] = '^' + key;
                }
                var url = wistorm_api._listUrl('_iotDevice', query_json, '_id,uid,objectId,model,uid,did,vehicleId,vehicleName,params,activeGpsData,createdAt', '-createdAt', '-createdAt', 0, 0, page_no, page_count, auth_code, true);
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
                        for(var i = 0; i < json.data.length; i++){
                            json.data[i].index = i;
                        }
                        json.aaData = json.data;
                        if(json.total === 1){
                            if($("#deviceKey").val() !== '' && json.data.length === 1){
                                var treeObj = $.fn.zTree.getZTreeObj("customerTree");
                                var node = treeObj.getNodeByParam("id", json.data[0].uid[json.data[0].uid.length-1], null);
                                if(node){
                                    cust_name = node.name;
                                    $('#selCustName').html(cust_name);
                                    treeObj.selectNode(node);
                                }
                            }
                        }

                        fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式
                    }
                });
            });
        }else{
            query_json = {
                uid: uid,
                map: 'BAIDU'
            };
            query_json[searchType] = '^' + key;
        }
    }else{
        query_json = {
            uid: uid,
            map: 'BAIDU'
        };
    }
    var page_count = aoData[4].value;
    var page_no = (aoData[3].value / page_count) + 1;
    var url = wistorm_api._listUrl('_iotDevice', query_json, '_id,uid,objectId,model,did,vehicleId,vehicleName,params,activeGpsData,createdAt', '-createdAt', '-createdAt', 0, 0, page_no, page_count, auth_code, true);
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
            for(var i = 0; i < json.data.length; i++){
                json.data[i].index = i;
            }
            json.aaData = json.data;
            if(json.total === 1){
                if($("#deviceKey").val() !== '' && json.data.length === 1){
                    var treeObj = $.fn.zTree.getZTreeObj("customerTree");
                    var node = treeObj.getNodeByParam("id", json.data[0].uid[json.data[0].uid.length-1], null);
                    if(node){
                        cust_name = node.name;
                        $('#selCustName').html(cust_name);
                        treeObj.selectNode(node);
                    }
                }
            }
            fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式
        }
    });
}

var showLocation = function showLocation(thisID, address) {
    thisID.html('(' + address + ')');
    thisID.attr('title', address);
};

var updateLoc = function(){
    setTimeout(function(){
        $(".locUpdate").each(function (i) {
            console.log(i + ',' + this);
            if (i != 0) {
                var loc = $(this).html().split(",");
                var lon = parseFloat(loc[0]);
                var lat = parseFloat(loc[1].trim());
                setLocation(i, lon, lat, $(this), showLocation);
            }
        });
    }, 100);
};

var querySuccess = function(url) {
    var gpsFlagDesc =
        ['',
            '<div class="offline">' + i18next.t("locate.bad") + '</div>',
            '<div class="online">' + i18next.t("locate.gps") + '</div>',
            '<div class="network">' + i18next.t("locate.lbs") + '</div>',
            '<div class="online">' + i18next.t("locate.bd") + '</div>'
        ];
    // var j, _j, UnContacter, Uncontacter_tel;
    // names = [];
    // for (var i = 0; i < json.data.length; i++) {
    //     json.data[i].version = json.data[i].params? json.data[i].params.version || '' : '';
    //     json.data[i].rcvTime = json.data[i].activeGpsData ? new Date(json.data[i].activeGpsData.rcvTime).format("yyyy-MM-dd hh:mm:ss"): '';
    //     json.data[i].createdAt = new Date(json.data[i].createdAt).format("yyyy-MM-dd hh:mm:ss");
    //     json.data[i].status = json.data[i].activeGpsData && getOnLine(json.data[i]) ? '在线': '离线';
    //     names.push(json.data[i].did);
    // }

    var _columns = [
        { "mData":null, "sClass":"center did", "searchable": false, "bSortable":false, "fnRender": function(obj){
            return "<input type='checkbox' id='" + obj.aData.did + "' value='" + obj.aData.did + "'>";
        }},
        { "mData":"did", "sClass":""},
        { "mData":null, "sClass":"", "fnRender": function(obj){
            return obj.aData.vehicleName? obj.aData.vehicleName : i18next.t("device.unbinded") ;
        }},
        { "mData":null, "sClass":"", "fnRender": function(obj){
            return obj.aData.params? obj.aData.params.iccid || '' : '';
        }},
        { "mData":"model", "sClass":"center" },
        { "mData":null, "sClass":"center", "fnRender": function(obj){
            return obj.aData.params? obj.aData.params.version || '' : '';
        }},
        { "mData":null, "sClass":"loc", "fnRender": function(obj){
            // return obj.aData.activeGpsData ? new Date(obj.aData.activeGpsData.rcvTime).format("MM-dd hh:mm:ss"): ''
            var desc = '';
            if(obj.aData.activeGpsData){
                var lon = i18next.language === 'zh' || i18next.language === 'zh-CN' ? obj.aData.activeGpsData.lon: obj.aData.activeGpsData.glon;
                var lat = i18next.language === 'zh' || i18next.language === 'zh-CN' ? obj.aData.activeGpsData.lat: obj.aData.activeGpsData.glat;
                desc = gpsFlagDesc[obj.aData.activeGpsData.gpsFlag];
                desc += '<div style="width:260px;overflow:hidden;white-space:nowrap; text-overflow:ellipsis" id="loc' + obj.aData.did + '">(' + lon.toFixed(6) + ', ' + lat.toFixed(6) + ')</div>';
                var interval = i18next.language === 'zh' || i18next.language === 'zh-CN' ? 300: obj.aData.index * 300;
                setTimeout(function () {
                    setLocation(0, lon, lat, $('#loc' + obj.aData.did), showLocation);
                }, interval);
            }
            return desc;
        }},
        { "mData":null, "sClass":"", "fnRender": function(obj){
            var desc = '';
            if(obj.aData.activeGpsData){
                desc = getOnLine(obj.aData) ? '<span class="online">' + i18next.t("system.online") +'</span>': '<span class="offline">' +   i18next.t("system.offline") +'</span>';
                desc += '&nbsp;( <span title="' + new Date(obj.aData.activeGpsData.rcvTime).format("yyyy-MM-dd hh:mm:ss") + '">' + new Date(obj.aData.activeGpsData.rcvTime).beautify() + '</span> )&nbsp;';
            }
            return desc;
        }},
        { "mData":null, "sClass":"center", "fnRender": function(obj){
            return new Date(obj.aData.createdAt).format("MM-dd hh:mm:ss");
        }},
        { "mData":null, "sClass":"center", "bSortable":false, "fnRender":function (obj) {
            var op = "<a href='#' title='分配终端' data-i18n='[title]device.assign_device'><i class='icon-tag' obj_id='" + obj.aData._id + "' did='" + obj.aData.did + "' cust_id='" + obj.aData.uid + "'></i></a>";
            var delOp = "&nbsp&nbsp<a href='#' title='编辑' data-i18n='[title]table.edit'><i class='icon-edit' obj_id='" + obj.aData._id + "' did='" + obj.aData.did + "'></i></a>&nbsp&nbsp<a href='#' title='删除' data-i18n='[title]table.delete'><i class='icon-remove' obj_id='" + obj.aData.objectId + "' did='" + obj.aData.did + "'></i></a>";
            var dealer_type = parseInt($.cookie('dealer_type'));
            if($("#__customer").length > 0) {
                if (dealer_type === 1 || dealer_type === 2) {
                    return op + delOp;
                } else {
                    return op;
                }
            }else{
                return '';
            }
        }
        }
    ];
    var lang = i18next.language || 'en';
    var objTable = {
        "bDestroy": true,
        "bAutoWidth": false,
        "sScrollX": "1430px",
        "bInfo": false,
        "iDisplayLength": 10,
        "bLengthChange": false,
        "bProcessing": true,
        "bServerSide": true,
        "bFilter": false,
        "aoColumns": _columns,
        "sDom": "<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": {"sUrl": 'css/' + lang + '.txt'},
        "sAjaxSource": "",
        "fnServerData": retrieveData
    };

    $('#deviceKey').typeahead({
        source: function (query, process) {
            process(names);
        }
    });

    _table = $("#vehicle_list").dataTable(objTable);
};

var getDevices = function(){
    var devices = $("#devices").val().split(/\s+/);
    var data = [];
    for(var i = 0; i < devices.length; i++){
        if(devices[i].trim() != ''){
            var pid = $.cookie('parent_id');
            var uids = pid === '829909845607059600' || pid === '' ? ['829909845607059600', uid]: ['829909845607059600', pid, uid];
            var create = {
                uid: uids,
                currentId: uid,
                did: devices[i].trim(),
                binded: false,
                model: $('#model').val(),
                workType: $('#workType').val()
            };
            data.push(create);
        }
    }
    return {
        data: JSON.stringify(data)
    };
};

var getAssignDevices = function(){
    var devices = $("#assginDevices").val().split(/\s+/);
    return {
        'did': devices.join('|')
    };
};

// 导入设备
var deviceImport = function(){
    if(uid === 0){
        _alert(i18next.t("system.select_customer"));
        return;
    }
    var create_json = getDevices();
    wistorm_api._createBatch('_iotDevice', create_json, auth_code, true, addSuccess);
};

var addSuccess = function(json) {
    if(json.status_code == 0){
        $("#divDevice").dialog("close");
        _query(uid);
    }else{
        _alert(i18next.t("device.msg_import_fail"), 3);
    }
};

// 分配设备
var deviceAssign = function(){
    if(assignUid == 0){
        _alert(i18next.t("system.select_customer"));
        return;
    }
    var query_json = getAssignDevices();
    var update_json = {
        'uid': '+' + assignUid
    };
    wistorm_api._updatePost('_iotDevice', query_json, update_json, auth_code, true, function(json){
        if(json.status_code == 0){
            $("#divDeviceAssign").dialog("close");
        }else{
            _alert(i18next.t("device.msg_assign_fail"), 3);
        }
    });
};

// 修改终端
var _edit = function(){
    var auth_code = $.cookie('auth_code');
    var obj_name = $('#obj_name').val();             //车牌号码
    var annual_inspect_alert = 0;          //只针对手机客户端，是否年检提醒
    var annual_inspect_date = "";  //只针对手机客户端，年检提醒时间
    var insurance_alert = 0;               //只针对手机客户端，是否保险提醒
    var insurance_date = "";       //只针对手机客户端，保险提醒时间
    var maintain_alert = 0;                //只针对手机客户端，是否车辆保养提醒
    var maintain_mileage = 0;          //只针对手机客户端，下次保养里程
    var reg_rule = {
        fee_type: { price: 120, period: 12 },
        mdt_type: { mdt_name: "WISE", protocol_ver: "1.0", fittings: ",60,61,64,63,65,", channel: 2 },
        card_type: 1,
        first_interval: 12
    };                    //只针对运营平台，需通过终端条码获取注册规则填入。对于手机客户端，保留
    var service_end_date = $('#service_end_date').val();     //针对运营平台，服务截止日期。对于手机客户端，保留
    var obj_type = $('#obj_type').val();                      //车辆类型，保留
    var device_id = $('#device_id').val();     //终端ID
    var serial = $('#serial').val();              //终端条码
    var sim = $('#sim').val();                //SIM卡号
    var workType = $('#workType').val();
    var sim_type = 1;                      //SIM卡类型，保留
    var mobile_operator = "";              //运营商，保留
    var op_mobile = "";                    //主号，当前手机号，保留
    var op_mobile2 = "";                   //副号，当前手机号，保留
    var brand = 1;                         //只针对手机客户端，车辆品牌  通过字典表获取dict_type=brand
    var mdt_type = 0;                      //保留
    var call_phones =
        [
            {
                manager: $('#manager').val(),
                driver: $('#driver').val(),
                phone: $('#phone').val(),
                phone1: $("#phone1").val(),
                obj_model: $("#obj_model").val()
            }                   //只针对手机客户端，用于一键呼叫
        ];                //只针对手机客户端，用于一键呼叫
    var sms_phones = "[]";                   //只针对手机客户端，暂时保留

    var obj_model = $("#obj_model").val();
    var query_json = {
        objectId: obj_id
    };
    var update_json = {
        name: obj_name,
        model: obj_model,
        did: device_id,
        sim: sim
    };
    wistorm_api._update('vehicle', query_json, update_json, auth_code, true, editSuccess);
};

var editSuccess = function(json) {
    if(json.status_code == 0){
        $("#divVehicle").dialog("close");
        _query(uid);
    }else{
        _alert(i18next.t("device.msg_edit_fail"));
    }
};

// 删除设备
var _delete = function(did){
    // if(uid === $.cookie('dealer_id')){
    //     var query_json = {
    //         did: did
    //     };
    //     wistorm_api._delete('_iotDevice', query_json, auth_code, true, deleteSuccess);
    // }else{
    var query_json = {
        did: did
    };
    var update_json = {
        uid: '-' + uid
    };
    wistorm_api._update('_iotDevice', query_json, update_json, auth_code, true, deleteSuccess);
    // }
};

var deleteSuccess = function(json) {
    if(json.status_code === 0){
        _query(uid);
    }else{
        _alert(i18next.t("device.msg_delete_fail"));
    }
};

// 修改终端
var deviceEdit = function(){
    var auth_code = $.cookie('auth_code');
    var workType = $('#editWorkType').val();
    var model = $("#editModel").val();
    var query_json = {
        did: did
    };
    var update_json = {
        workType: workType,
        model: model
    };
    wistorm_api._update('_iotDevice', query_json, update_json, auth_code, true, function(json){
        if(json.status_code == 0){
            $("#divDeviceEdit").dialog("close");
            _query(uid);
        }else{
            _alert(i18next.t("device.msg_edit_fail"));
        }
    });
};

var updateDevice = function (did, update, callback) {
    var query = {
        did: did
    };
    wistorm_api._update('_iotDevice', query, update, auth_code, true, function (obj) {
        return callback(obj);
    });
};

var count = 0;
var countAssign = 0;

$(document).ready(function () {
    $("#alert").hide();

    $('#assign').css('display', $('#__customer').length > 0? 'inline-block': 'none');

    // Initialize placeholder
    // $.Placeholder.init();
    windowResize();
    $(window).resize(function () {
        windowResize();
    });

    $("#checkAll").click(function () {
        $("[type='checkbox']").prop("checked", $('#checkAll').prop("checked"));//全选
    });

    $(document).on("click", "#vehicle_list .icon-tag", function () {
        var obj_id = parseInt($(this).attr("obj_id"));
        var did = $(this).attr("did");
        $('#assginDevices').val(did);
        vehicleDeviceList();
    });

    $(document).on("click", "#vehicle_list .icon-remove", function () {
        var obj_id = parseInt($(this).attr("obj_id"));
        var did = $(this).attr("did");
        if (CloseConfirm(i18next.t("device.msg_confirm_delete", {did: did}))) {
            _delete(did);
        }
    });

    $(document).on("click", "#vehicle_list .icon-edit", function () {
        obj_id = parseInt($(this).attr("obj_id"));
        did = $(this).attr("did");
        deviceInfo(did);
    });

    // $("#searchCustomer").click(function () {
    //     // customerQuery();
    //     var treeObj = $.fn.zTree.getZTreeObj("customerTree");
    //     var node = treeObj.getNodeByParam("name", $('#customerKey').val(), null);
    //     treeObj.selectNode(node);
    //     $('#selCustName').html(node.name);
    //     uid = node.id;
    //     _query(node.id);
    // });

    $('#searchKey').keydown(function(e){
        var curKey = e.which;
        if(curKey == 13){
            customerQuery();
            return false;
        }
    });


    var deviceId = setInterval(function(){
        if(!i18nextLoaded){
            return;
        }
        var buttons = {};
        buttons[i18next.t("device.import")] = function () {
            $('#frmDevice').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            _validator.resetForm();
            $(this).dialog("close");
        };
        // Dialog Simple
        $('#divDevice').dialog({
            autoOpen:false,
            width:480,
            buttons:buttons
        });

        $('#frmDevice').submit(function () {
            if ($('#frmDevice').valid()) {
                if(CloseConfirm(i18next.t("device.msg_confirm_import", {count: count}))){
                    deviceImport();
                }
            }
            return false;
        });

        var buttons = {};
        buttons[i18next.t("device.assign")] = function () {
            $('#frmDeviceAssign').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            _validator.resetForm();
            $(this).dialog("close");
        };
        $('#divDeviceAssign').dialog({
            autoOpen:false,
            width:480,
            buttons:buttons
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmDeviceEdit').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            _validator.resetForm();
            $(this).dialog("close");
        };
        $('#divDeviceEdit').dialog({
            autoOpen:false,
            width:480,
            buttons:buttons
        });
        $('#frmDeviceEdit').submit(function () {
            if ($('#frmDeviceEdit').valid()) {
                deviceEdit();
            }
            return false;
        });

        $('#frmDeviceAssign').submit(function () {
            if ($('#frmDeviceAssign').valid()) {
                var count = $("#assginDevices").val().split(/\s+/).length;
                if(CloseConfirm(i18next.t("device.msg_confirm_assign", {count: count, assignName:assignName}))){
                    deviceAssign();
                }
            }
            return false;
        });

        $('#deviceKey').keydown(function(e){
            var curKey = e.which;
            if(curKey == 13){
                _query(uid, tree_path);
                return false;
            }
        });

        $("#unbind").click(function () {
            if(!CloseConfirm(i18next.t("device.msg_confirm_unbind"))){
                return;
            }
            var query_json = {
                did: did
            };
            var update_json = {
                did: ''
            };
            wistorm_api._update('vehicle', query_json, update_json, auth_code, true, function(json){
                if(json.status_code == 0){
                    // 更新设置的vehicleId和vehicleName
                    var update = {
                        vehicleId: '',
                        vehicleName: '',
                        binded: false
                    };
                    updateDevice(did, update, function(dev){
                        if(dev.status_code == 0){
                            _ok(i18next.t("device.msg_unbind_success"));
                            $('#editVehicleName').val('');
                            $('#unbind').css("display","none");
                            _query(uid);
                        }else{
                            _alert(i18next.t("device.msg_unbind_fail"), 2);
                        }
                    });
                }else{
                    _alert(i18next.t("device.msg_unbind_fail"), 2);
                }
            });
        });

        _validator = $('#frmDevice').validate(
            {
                rules:{
                    devices:{
                        required:true
                    },
                    model: {
                        required:true
                    }
                },
                messages:{
                    devices:{required:i18next.t("device.devices_required")},
                    model:{required:i18next.t("device.model_required")}
                },
                highlight:function (element) {
                    $(element).closest('.control-group').removeClass('success').addClass('error');
                },
                success:function (element) {
                    element
                        .text('OK!').addClass('valid')
                        .closest('.control-group').removeClass('error').addClass('success');
                    //alert('success');
                }
            });

        $('#import').click(function(){
            if(uid === 0){
                _alert(i18next.t("system.select_customer"));
                return;
            }
            _validator.resetForm();
            $("#divDevice").dialog("open");
        });

        $('#assign').click(function(){
            var dids = $("[type='checkbox']:checked:not(#checkAll)");
            var checkDids = [];
            for (var i = 0; i < dids.length; i++) {
                checkDids.push($(dids[i]).val());
            }
            $('#assginDevices').val(checkDids.join('\r'));
            vehicleDeviceList();
        });

        $('#refresh').click(function(){
            _query(uid);
        });

        $('#csvfile').change(function () {
            $("input[name=csvfile]").csv2arr(function(arr){
                console.log( arr );
                //something to do here
                var str = '';
                $.each( arr, function(i, line){
                    str += line.join(',') + '\r';
                });
                $("#devices").val(str);
                count = arr.length;
                $("#count").text(i18next.t("device.device_quantity") + arr.length);
            });
        });
        $('#csvfileAssign').change(function () {
            $("input[name=csvfileAssign]").csv2arr(function(arr){
                console.log( arr );
                //something to do here
                var str = '';
                $.each( arr, function(i, line){
                    str += line.join(',') + '\r';
                });
                $("#assginDevices").val(str);
                countAssign = arr.length;
                $("#countAssign").text(i18next.t("device.device_quantity") + arr.length);
            });
        });

        customerQuery();
        clearInterval(deviceId);
    }, 100);
});