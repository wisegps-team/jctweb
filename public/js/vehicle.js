/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */
var auth_code = $.cookie('auth_code');
var dealer_name = $.cookie('name');
var doing = false;
var assignUid = 0;
var assignName = '';
var assignTreePath = '';
var vehicle_flag = 1;   //1: 新增  2: 修改
var edit_cust_name = '';
var edit_obj_name = '';
var edit_sim = '';
var edit_serial = '';
var vehicle_table;
var cust_id = 0;
var uid = 0;
var parent_cust_id = 0;
var cust_name = "";
var user_name = "";
var obj_id = 0;
var did = '';
var tree_path = '';
var level = 0;
var validator_vehicle;
var selectNode = null;
var assignDepartId = 0;
var assignDepartName = '';
var departs = {};
var dealer_type = $.cookie('dealer_type');
var login_depart_id = $.cookie('login_depart_id');

function windowResize() {
    var height = $(window).height() - 122;
    $('#customerTree').css({ "height": height + "px" });
}

// 车辆详细信息
function vehicleInfo(obj_id) {
    debugger;
    // var auth_code = $.cookie('auth_code');
    // var searchUrl = $.cookie('Host') + "vehicle/" + obj_id;
    // var searchData = { auth_code:auth_code };
    // var searchObj = { type:"GET", url:searchUrl, data:searchData, success:function (json) {
    //     vehicleInfoSuccess(json);
    // }, error:OnError };
    // ajax_function(searchObj);
    query_json = {
        objectId: obj_id
    };
    // wistorm_api._get('vehicle', query_json, 'objectId,departId,name,model,did,sim,serviceExpireIn,contact,tel,remark', auth_code, true, function(json){
    //     vehicleInfoSuccess(json.data);
    // });
    wistorm_api._list('vehicle', query_json, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (json) {
        vehicleInfoSuccess(json.data[0]);
    })

}

function vehicleCustomerList(obj_id, obj_name, cust_id) {
    initFrmCustomerList("更换用户", obj_id, obj_name, cust_id);
    $("#divCustomerList").dialog("open");
}

// 跳转到日志页面
function logInfo(device_id) {
    var logUrl = "/datalog?device_id=" + device_id;
    window.location.href = logUrl;
}

var vehicleInfoSuccess = function (json) {
    //alert(json);
    debugger;
    validator_vehicle.resetForm();
    json.serviceExpireIn = NewDate(json.serviceExpireIn);

    json.maintainExpireIn = json.maintainExpireIn || '';
    json.insuranceExpireIn = json.insuranceExpireIn || '';
    json.inspectExpireIn = json.inspectExpireIn || '';
    json.maintainExpireIn = json.maintainExpireIn.indexOf('T') > -1 ? NewDate(json.maintainExpireIn) : '';
    json.insuranceExpireIn = json.insuranceExpireIn.indexOf('T') > -1 ? NewDate(json.insuranceExpireIn) : '';
    json.inspectExpireIn = json.inspectExpireIn.indexOf('T') > -1 ? NewDate(json.inspectExpireIn) : '';
    json.serviceExpireIn = json.serviceExpireIn.format("yyyy-MM-dd");
    json.maintainExpireIn = json.maintainExpireIn.format("yyyy-MM-dd");
    json.insuranceExpireIn = json.insuranceExpireIn.format("yyyy-MM-dd");
    json.inspectExpireIn = json.inspectExpireIn.format("yyyy-MM-dd");
    var title = i18next.t("vehicle.edit_vehicle");
    // debugger;
    initFrmVehicle(title, 2, json.name, json.did, json.sim, json.model, json.maintainMileage, json.maintainExpireIn, json.insuranceExpireIn, json.inspectExpireIn, json.serviceExpireIn, json.contact, json.tel, json.desc, json.remark, json.departId);
    $("#divVehicle").dialog("open");
};

// 初始化车辆信息窗体
var initFrmVehicle = function (title, flag, obj_name, device_id, sim, obj_model, maintainMileage, maintainExpireIn, insuranceExpireIn, inspectExpireIn, service_end_date, contact, tel, desc, remark, departId) {
    $("#divVehicle").dialog("option", "title", title);
    vehicle_flag = flag;
    $('#obj_name').val(obj_name);
    assignDepartId = departId;
    $('#depart_name').val(departs[departId] || '');
    edit_obj_name = obj_name;
    $('#device_id').val(device_id);
    $('#sim').val(sim);
    edit_sim = sim;
    $('#obj_model').val(obj_model);
    $('#contact').val(contact);
    $('#tel').val(tel);
    $('#vehicleType')[0].selectedIndex = desc == '02' ? 1 : 0;
    $('#remark').val(remark);
    $('#inspectExpireIn').val(inspectExpireIn);
    $('#maintainMileage').val(maintainMileage);
    $('#maintainExpireIn').val(maintainExpireIn);
    $('#insuranceExpireIn').val(insuranceExpireIn)
    $('#service_end_date').val(service_end_date);
    if (vehicle_flag == 1) {
        $('#device_id').removeAttr("disabled");
        $('#service_panel').show();
        $('#service_end_date_panel').hide();
    } else {
        if (device_id != '') {
            $('#device_id').attr("disabled", "disabled");
            $('#bind').css("display", "none");
            $('#unbind').css("display", "inline-block");
        } else {
            $('#device_id').removeAttr("disabled");
            $('#bind').css("display", "inline-block");
            $('#unbind').css("display", "none");
        }
        $('#service_panel').hide();
        $('#service_end_date_panel').show();
    }
};

var initFrmCustomerList = function (title, obj_id, obj_name, cust_id) {
    $("#divCustomerList").dialog("option", "title", title);
    $('#change_obj_id').val(obj_id);
    $('#change_obj_name').val(obj_name);
    $('#change_cust_id').html("");
    for (var i = 0; i < customers.length; i++) {
        $('#change_cust_id').append("<option value='" + customers[i].cust_id + "'>" + customers[i].cust_name + "</option>");
    }
    $("#change_cust_id").get(0).value = cust_id;
};

function getAllDepart() {
    var dealer_type = $.cookie('dealer_type');
    var dealer_id = $.cookie('dealer_id');

    var query_json = {
        uid: dealer_id
    };
    debugger;
    wistorm_api._list('department', query_json, 'objectId,name,parentId,uid', 'name', 'name', 0, 0, 1, -1, auth_code, true, function (json) {
        var onCustomerAssignClick = function (event, treeId, treeNode) {

            if (parseInt(treeNode.id) > -1) {
                assignDepartId = treeNode.id;
                assignDepartName = treeNode.name;
            }
        };

        var settingAssign = {
            view: { showIcon: true },
            check: { enable: false, chkStyle: "checkbox" },
            data: { simpleData: { enable: true } },
            callback: { onClick: onCustomerAssignClick }
        };

        var selectArray = [];
        var rootArray = [];
        selectArray.push({
            open: false,
            id: dealer_id,
            pId: 0,
            name: dealer_name,
            icon: treeIcon['8']
        });
        // 创建三个分类的根节点
        for (var i = 0; i < json.data.length; i++) {
            // 如果为成员登陆，则加载本级及下级
            if (['9', '12', '13'].indexOf(dealer_type) > -1) {
                if (json.data[i].objectId.toString() !== login_depart_id && json.data[i].parentId.toString() !== login_depart_id) {
                    continue;
                }
            }
            departs[json.data[i].objectId.toString()] = json.data[i].name;
            var pId = dealer_id;
            if (json.data[i]['parentId'] > 0) {
                pId = json.data[i]['parentId'];
            }
            selectArray.push({
                open: false,
                id: json.data[i]['objectId'],
                treePath: json.data[i]['treePath'],
                pId: pId,
                name: json.data[i]['name'],
                icon: treeIcon['99'],
                isDepart: true
            });
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
        $.fn.zTree.init($("#departTreeAssign"), settingAssign, selectArray);
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var root = treeObj.getNodeByParam("id", dealer_id, null);
        if (root) {
            treeObj.addNodes(root, rootArray);
        }
    });
}

var devices = [];
// 终端查询
function deviceQuery() {
    var query_json = {
        uid: $.cookie('dealer_id')
    };
    wistorm_api._list('_iotDevice', query_json, 'did', 'did', '-createdAt', 0, 0, 1, -1, auth_code, true, function (json) {
        for (var i = 0; i < json.data.length; i++) {
            if (!json.data[i].binded) {
                devices.push(json.data[i].did);
            }
        }
        $('#device_id').typeahead({
            source: function (query, process) {
                process(devices);
            }
        });
    });
}

function customerQuery() {
    var dealer_type = $.cookie('dealer_type');
    var dealer_id = $.cookie('dealer_id');
    var tree_path = $.cookie('tree_path');
    var key = '';
    if ($('#searchKey').val() !== '') {
        key = $('#searchKey').val().trim();
    }
    var page_no = 1;
    var page_count = 1000;

    // var searchUrl = $.cookie('Host') + "dealer/" + dealer_id + "/customer";
    // var searchData = { auth_code:auth_code, tree_path: tree_path, dealer_type: dealer_type, key:key, page_no:page_no, page_count:page_count };
    // var searchObj = { type:"GET", url:searchUrl, data:searchData, success:function (json) {
    //     customerQuerySuccess(json);
    // }, error:OnError };
    // ajax_function(searchObj);
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
        //         if(parseInt(treeNode.id) > 100){
        uid = treeNode.id;
        tree_path = treeNode.treePath;
        selectNode = treeNode;
        cust_id = treeNode.id;
        $.cookie('uid', uid);
        cust_name = treeNode.name;
        $('#selCustName').html(cust_name);
        vehicleQuery(uid, treeNode.isDepart);
        // }
    };

    var onCustomerAssignClick = function (event, treeId, treeNode) {
        //        alert(treeNode.tree_path);
        if (parseInt(treeNode.id) > -1) {
            assignUid = treeNode.id;
            assignTreePath = treeNode.treePath;
            assignName = treeNode.name;
        }
    };

    var onCustomerSelectDblClick = function (event, treeId, treeNode) {
        // var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        // if(treeNode.id !== $.cookie('dealer_id')){
        //     loadSubNode(treeObj, treeNode);
        // }
    };

    var onCustomerAssignDblClick = function (event, treeId, treeNode) {
        // var treeObj = $.fn.zTree.getZTreeObj("customerTreeAssign");
        // loadSubNode(treeObj, treeNode);
    };

    var setting = {
        view: { showIcon: true },
        check: { enable: false, chkStyle: "checkbox" },
        data: { simpleData: { enable: true } },
        callback: { onClick: onCustomerSelectClick, onDblClick: onCustomerSelectDblClick }
    };
    var settingAssign = {
        view: { showIcon: true },
        check: { enable: false, chkStyle: "checkbox" },
        data: { simpleData: { enable: true } },
        callback: { onClick: onCustomerAssignClick, onDblClick: onCustomerAssignDblClick }
    };

    var customerArray = [];
    var selectArray = [];
    // customerArray.push({
    //     open: true,
    //     id: $.cookie('dealer_id'),
    //     pId: 0,
    //     name: '我的车辆',
    //     icon: '/img/customer.png'
    // });
    // selectArray.push({
    //     open: true,
    //     id: $.cookie('dealer_id'),
    //     pId: 0,
    //     name: '恢复到上级用户',
    //     icon: '/img/restore.png'
    // });
    // uid = $.cookie('dealer_id');
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
        // json.data[i]['open'] = true;
        // json.data[i]['id'] = json.data[i]['objectId'];
        // json.data[i]['pId'] = json.data[i]['custType'];
        // json.data[i]['name'] = json.data[i]['name'];
        // json.data[i]['icon'] = '/img/customer.png';
        var childCount = json.data[i]['other'] ? (json.data[i]['other']['childCount'] || 0) : 0;
        var vehicleCount = json.data[i]['other'] ? (json.data[i]['other']['vehicleCount'] || 0) : 0;
        customerArray.push({
            open: false,
            id: json.data[i]['uid'],
            treePath: json.data[i]['treePath'],
            pId: json.data[i]['parentId'][0],
            name: json.data[i]['name'] + '(' + childCount + '/' + vehicleCount + ')',
            _name: json.data[i]['name'],
            childCount: childCount,
            vehicleCount: vehicleCount,
            icon: treeIcon[json.data[i]['custType']]
        });
        selectArray.push({
            open: false,
            id: json.data[i]['uid'],
            treePath: json.data[i]['treePath'],
            pId: json.data[i]['parentId'][0],
            name: json.data[i]['name'] + '(' + childCount + '/' + vehicleCount + ')',
            _name: json.data[i]['name'],
            childCount: childCount,
            vehicleCount: vehicleCount,
            icon: treeIcon[json.data[i]['custType']]
        });
    }
    $.fn.zTree.init($("#customerTree"), setting, customerArray);
    $.fn.zTree.init($("#customerTreeAssign"), settingAssign, selectArray);

    $('#customerKey').typeahead({ source: names });

    if (uid > 0) {
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var node = treeObj.getNodeByParam("id", uid, null);
        if (node) {
            tree_path = node.treePath;
            cust_name = node.name;
            $('#selCustName').html(cust_name);
            treeObj.selectNode(node);
        } else {
            uid = $.cookie('dealer_id');
            tree_path = $.cookie('tree_path');
            node = treeObj.getNodeByParam("id", uid, null);
            tree_path = node.treePath;
            cust_name = node.name;
            $('#selCustName').html(cust_name);
            treeObj.selectNode(node);
        }
        if (typeof vehicleQuery != "undefined") {
            vehicleQuery(uid, "");
        }
    }
};

// 车辆查询
function vehicleQuery(cust_id, is_depart) {
    // var mode = "current"; //all
    // var page_no = 1;
    // var page_count = 1000;
    var key = '';
    if ($("#vehicleKey").val() !== '') {
        key = $("#vehicleKey").val().trim();
    }
    //
    // var searchUrl = $.cookie('Host') + "customer/" + cust_id + "/vehicle/search";
    // var searchData = { auth_code:auth_code, tree_path:tree_path, mode:mode, page_no:page_no, page_count:page_count, key:key };
    // var searchObj = { type:"GET", url:searchUrl, data:searchData, success:function (json) {
    //     vehicleQuerySuccess(json);
    // }, error:OnError };
    // ajax_function(searchObj);
    var query_json;
    if (key !== "") {
        var searchType = $('#searchType').val();
        if (is_depart) {
            query_json = {
                departId: cust_id
            };
            query_json[searchType] = '^' + key;
        } else if ($('#allNode').is(':checked')) {
            query_json = {
                treePath: '^' + tree_path
            };
            setLoading("vehicle_list");
            wistorm_api._list('customer', query_json, 'uid', 'uid', '-createdAt', 0, 0, 1, -1, auth_code, true, function (json) {
                var uids = [];
                uids.push(uid.toString());
                for (var i = 0; i < json.data.length; i++) {
                    uids.push(json.data[i].uid);
                }
                query_json = {
                    uid: uids.join('|')
                };
                query_json[searchType] = '^' + key;
                wistorm_api._list('vehicle', query_json, 'objectId,uid,name,model,did,sim,serviceRegDate,serviceExpireIn,contact,tel', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, true, vehicleQuerySuccess)
            });
        } else {
            query_json = {
                uid: cust_id
            };
            query_json[searchType] = '^' + key;
            if (['9', '12', '13'].indexOf(dealer_type) > -1) {
                query_json['departId'] = login_depart_id;
            }
        }
    } else {
        if (is_depart) {
            query_json = {
                departId: cust_id
            };
        } else {
            query_json = {
                uid: cust_id
            };
            if (['9', '12', '13'].indexOf(dealer_type) > -1) {
                query_json['departId'] = login_depart_id;
            }
        }
    }
    setLoading("vehicle_list");
    wistorm_api._list('vehicle', query_json, 'objectId,name,model,did,sim,serviceRegDate,serviceExpireIn,contact,tel', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, true, vehicleQuerySuccess)
}

var names = [];

var vehicleQuerySuccess = function (json) {
    var j, _j, UnContacter, Uncontacter_tel;
    names = [];
    // if(json.status_code === 0 && selectNode && selectNode.id !== $.cookie('dealer_id')){
    //     var treeObj = $.fn.zTree.getZTreeObj("customerTree");
    //     selectNode.name = selectNode._name + '(' + selectNode.childCount + '/' + json.total + ')';
    //     treeObj.updateNode(selectNode);
    // }
    for (var i = 0; i < json.data.length; i++) {
        json.data[i].serviceRegDate = NewDate(json.data[i].serviceRegDate);
        json.data[i].serviceRegDate = json.data[i].serviceRegDate.format("yyyy-MM-dd");
        json.data[i].serviceExpireIn = NewDate(json.data[i].serviceExpireIn);
        json.data[i].serviceExpireIn = json.data[i].serviceExpireIn.format("yyyy-MM-dd");
        json.data[i].sim = json.data[i].sim || '';
        json.data[i].contact = json.data[i].contact || '';
        json.data[i].tel = json.data[i].tel || '';
        names.push(json.data[i].name);
    }

    var _columns = [
        { "mData": "name", "sClass": "ms_left" },
        { "mData": "did", "sClass": "center" },
        // { "mData":"serial", "sClass":"center" },
        { "mData": "sim", "sClass": "center" },
        { "mData": "contact", "sClass": "center" },
        { "mData": "tel", "sClass": "center" },
        { "mData": "serviceRegDate", "sClass": "center" },
        { "mData": "serviceExpireIn", "sClass": "center" },
        {
            "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                return "<a href='#' title='编辑' data-i18n='[title]table.edit'><i class='icon-edit' obj_id='" + obj.aData.objectId + "' did='" + obj.aData.did + "'></i></a>&nbsp&nbsp<a href='#' title='更换用户' data-i18n='[title]table.change_parent'><i class='icon-retweet' obj_id='" + obj.aData.objectId + "' obj_name='" + obj.aData.name + "' did='" + obj.aData.did + "'></i></a>&nbsp&nbsp<a href='#' title='删除' data-i18n='[title]table.delete'><i class='icon-remove' obj_id='" +
                    obj.aData.objectId + "' obj_name='" + obj.aData.name + "' did='" + obj.aData.did + "'></i></a>";
            }
        }
    ];
    var lang = i18next.language || 'en';
    var objTable = {
        "bInfo": false,
        "bLengthChange": false,
        "bProcessing": true,
        "bServerSide": false,
        "bFilter": false,
        "aaData": json.data,
        "aoColumns": _columns,
        "sDom": "<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": { "sUrl": 'css/' + lang + '.txt' }
    };
    //$('#vehicleKey').typeahead({source:names});

    $('#vehicleKey').typeahead({
        source: function (query, process) {
            process(names);
        }
    });

    if (vehicle_table) {
        vehicle_table.fnClearTable();
        vehicle_table.fnAddData(json.data);
    } else {
        vehicle_table = $("#vehicle_list").dataTable(objTable);
        windowResize();
    }

    if ($("#vehicleKey").val() !== '' && json.data.length === 1) {
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var node = treeObj.getNodeByParam("id", json.data[0].uid, null);
        cust_name = node.name;
        $('#selCustName').html(cust_name);
        treeObj.selectNode(node);
    }
};

var setVehicleTable = function (is_simple) {
    if (vehicle_table) {
        if (is_simple) {
            vehicle_table.fnSetColumnVis(1, false);
            vehicle_table.fnSetColumnVis(2, false);
            vehicle_table.fnSetColumnVis(3, false);
            vehicle_table.fnSetColumnVis(4, false);
        } else {
            vehicle_table.fnSetColumnVis(1, true);
            vehicle_table.fnSetColumnVis(2, true);
            vehicle_table.fnSetColumnVis(3, true);
            vehicle_table.fnSetColumnVis(4, true);
        }
    }
};

var updateDevice = function (did, update, callback) {
    var query = {
        did: did
    };
    wistorm_api._update('_iotDevice', query, update, auth_code, true, function (obj) {
        return callback(obj);
    });
};

// 新增车辆
var vehicleAdd = function () {
    if (doing) {
        return;
    }
    doing = true;
    if (uid === 0) {
        _alert(i18next.t("system.select_customer"));
        return;
    }
    var obj_name = $('#obj_name').val();   //车牌号码
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
    var contact = $('#contact').val();
    var tel = $('#tel').val();
    var desc = $('#vehicleType').val();
    var remark = $('#remark').val();
    var inspectExpireIn = $('#inspectExpireIn').val();
    var maintainMileage = $('#maintainMileage').val();
    var maintainExpireIn = $('#maintainExpireIn').val();
    var insuranceExpireIn = $('#insuranceExpireIn').val()
    var sim_type = 1;                      //SIM卡类型，保留
    var mobile_operator = "";              //运营商，保留
    var op_mobile = "";                    //主号，当前手机号，保留
    var op_mobile2 = "";                   //副号，当前手机号，保留
    var brand = 1;                         //只针对手机客户端，车辆品牌  通过字典表获取dict_type=brand
    var mdt_type = 0;                      //保留
    var call_phones =
        [
            {
                obj_model: $('#obj_model').val(),
                manager: $('#manager').val(),
                driver: $('#driver').val(),
                phone: $('#phone').val(),
                phone1: $("#phone1").val(),
                obj_model: $("#obj_model").val()
            }                   //只针对手机客户端，用于一键呼叫
        ];
    var sms_phones = [];                   //只针对手机客户端，暂时保留
    var obj_model = $('#obj_model').val();

    var now = new Date();
    var create_json = {
        name: obj_name,
        model: obj_model,
        did: device_id.trim(),
        sim: sim,
        uid: uid,
        departId: assignDepartId || '',
        contact: contact,
        tel: tel,
        desc: desc,
        maintainMileage: maintainMileage,
        maintainExpireIn: maintainExpireIn,
        insuranceExpireIn: insuranceExpireIn,
        inspectExpireIn: inspectExpireIn,
        remark: remark,
        serviceRegDate: now.format('yyyy-MM-dd hh:mm:ss'),
        serviceExpireIn: new Date(now.setFullYear(now.getFullYear() + 1)).format('yyyy-MM-dd hh:mm:ss'),
        brand: '',
        battery: '',
        color: ''
    };
    wistorm_api._create('vehicle', create_json, auth_code, true, function (json) {
        if (json.status_code === 0) {
            // 更新设置的vehicleId和vehicleName
            var uids = uid;
            if (tree_path != '' && tree_path) {
                uids = tree_path.split(',').filter(function (item) { return item !== '' }).join('|');
            }
            var update = {
                vehicleId: json.objectId,
                vehicleName: obj_name,
                binded: true,
                bindDate: now.format('yyyy-MM-dd hh:mm:ss'),
                uid: '+' + uids
            };
            updateDevice(device_id, update, function (dev) {
                if (dev.status_code === 0) {
                } else {
                    console.log('Update device fail, please try again');
                }
                $("#divVehicle").dialog("close");
                doing = false;
                // 更新用户车辆数
                updateVehicleCount(uid.toString());
                vehicleQuery(uid, tree_path);
            });
        } else {
            doing = false;
            _alert(i18next.t("vehicle.msg_add_fail"));
        }
    });
};

// var vehicleAddSuccess = function(json) {
//     if(json.status_code == 0){
//         $("#divVehicle").dialog("close");
//         vehicleQuery(uid, tree_path);
//         // 更新设置的vehicleId和vehicleName
//         var update = {
//             vehicleId: json.objectId,
//             vehicleName: plate
//         };
//         owner.updateDevice(did, update, function(dev){
//             if(dev.status_code == 0){
//             }else{
//                 console.log('更新设备信息失败，请稍后重试');
//             }
//         });
//     }else{
//         alert("新增车辆失败，请稍后再试");
//     }
// };

// 修改车辆
var vehicleEdit = function () {
    debugger;
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
    var contact = $('#contact').val();
    var tel = $('#tel').val();
    var desc = $('#vehicleType').val();
    var remark = $('#remark').val();
    var inspectExpireIn = $('#inspectExpireIn').val();
    var maintainMileage = $('#maintainMileage').val();
    var maintainExpireIn = $('#maintainExpireIn').val();
    var insuranceExpireIn = $('#insuranceExpireIn').val()
    // var 
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
        departId: assignDepartId || '',
        name: obj_name,
        model: obj_model,
        did: device_id.trim(),
        sim: sim,
        contact: contact,
        tel: tel,
        desc: desc,
        remark: remark,
        maintainMileage: maintainMileage,
        maintainExpireIn: maintainExpireIn,
        insuranceExpireIn: insuranceExpireIn,
        inspectExpireIn: inspectExpireIn,
    };
    wistorm_api._update('vehicle', query_json, update_json, auth_code, true, function (json) {
        if (json.status_code == 0) {
            $("#divVehicle").dialog("close");
            vehicleQuery(uid, tree_path);
            if (did !== device_id) {
                // 解绑原有的终端ID
                var update = {
                    vehicleId: '',
                    vehicleName: '',
                    binded: false,
                    uid: '-' + uid
                };
                updateDevice(did, update, function (dev) {
                    if (dev.status_code == 0) {
                    } else {
                        console.log('Unbind device fail, pls try again');
                    }
                });
            }
            var uids = uid;
            if (tree_path != '' && tree_path) {
                uids = tree_path.split(',').filter(function (item) { return item !== '' }).join('|');
            }
            // 更新设置的vehicleId和vehicleName
            var now = new Date();
            var update = {
                vehicleId: obj_id,
                vehicleName: obj_name,
                binded: true,
                bindDate: now.format('yyyy-MM-dd hh:mm:ss'),
                uid: '+' + uids
            };
            updateDevice(device_id, update, function (dev) {
                if (dev.status_code == 0) {
                } else {
                    console.log('Update device fail, please try again');
                }
            });
        } else {
            _alert(i18next.t("vehicle.msg_save_fail"));
        }
    });
};

// var vehicleEditSuccess = function(json) {
//     if(json.status_code == 0){
//         $("#divVehicle").dialog("close");
//         vehicleQuery(uid, tree_path);
//     }else{
//         alert("修改车辆失败，请稍后再试");
//     }
// };

// 新增车辆
var vehicleDelete = function (obj_id, device_id) {
    // var auth_code = $.cookie('auth_code');
    //
    // var sendUrl = $.cookie('Host') + "vehicle/" + obj_id + "?access_token=" + auth_code;
    // var sendData = {
    //     cust_id: cust_id
    // };
    // var sendObj = { type:"DELETE", url:sendUrl, data:sendData, success:function (json) {
    //     vehicleDeleteSuccess(json);
    // }, error:OnError };
    // ajax_function(sendObj);
    var query_json = {
        objectId: obj_id
    };

    wistorm_api._delete('vehicle', query_json, auth_code, true, function (json) {
        if (json.status_code == 0) {
            // 更新设置的vehicleId和vehicleName
            var update = {
                vehicleId: '',
                vehicleName: '',
                binded: false,
                uid: '-' + uid
            };
            updateDevice(device_id, update, function (dev) {
                if (dev.status_code == 0) {
                } else {
                    console.log('Update device fail, please try again');
                }
            });
            // 更新用户车辆数
            updateVehicleCount(uid.toString());
            vehicleQuery(uid, tree_path);
        } else {
            _alert(i18next.t("vehicle.msg_delete_fail"));
        }
    });
};

// var vehicleDeleteSuccess = function(json) {
//     if(json.status_code == 0){
//         vehicleQuery(uid, tree_path);
//         // 更新设置的vehicleId和vehicleName
//     }else{
//         _alert("删除车辆失败，请稍后再试");
//     }
// };

// 车辆更换所属用户
var vehicleChangeCustomer = function (obj_id, change_cust_id, device_id) {
    var query_json = {
        objectId: obj_id
    };
    var update_json = {
        uid: change_cust_id
    };
    wistorm_api._update('vehicle', query_json, update_json, auth_code, true, function (json) {
        if (json.status_code === 0) {
            // 更新设置的vehicleId和vehicleName
            var update = {
                uid: '+' + change_cust_id
            };
            updateDevice(device_id, update, function (dev) {
                $("#divCustomerAssign").dialog("close");
                if (dev.status_code === 0) {
                    vehicleQuery(uid, tree_path);
                } else {
                    // _alert('更新设备所属失败');
                }
                // 更新用户车辆数
                updateVehicleCount(uid.toString());
                updateVehicleCount(assignUid.toString());
                vehicleQuery(uid, tree_path);
            });
        } else {
            _alert(i18next.t("vehicle.err_change_parent"));
        }
    });
};

// var vehicleChangeCustomerSuccess = function(json) {
//     if(json.status_code == 0){
//         $("#divCustomerAssign").dialog("close");
//         vehicleQuery(uid, tree_path);
//     }else{
//         _alert("更换车辆所属用户失败，请稍后再试");
//     }
// };

$(document).ready(function () {
    $("#alert").hide();

    // Initialize placeholder
    // $.Placeholder.init();

    windowResize();
    $(window).resize(function () {
        windowResize();
    });

    var id = setInterval(function () {
        var dateOption = {
            language: $.cookie("lang"),
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            showMeridian: 1,
            minView: 2
        }
        $('.insuranceExpireIn').datetimepicker(dateOption);
        $('#insuranceExpireIn').val(new Date().format('yyyy-MM-dd'));
        $('.maintainExpireIn').datetimepicker(dateOption);
        $('#maintainExpireIn').val(new Date().format('yyyy-MM-dd'));
        $('.inspectExpireIn').datetimepicker(dateOption);
        $('#inspectExpireIn').val(new Date().format('yyyy-MM-dd'));

        if (!i18nextLoaded) {
            return;
        }

        $(document).on("click", "#vehicle_list .icon-remove", function () {
            obj_id = parseInt($(this).attr("obj_id"));
            obj_name = $(this).attr("obj_name");
            did = $(this).attr("did");
            if (CloseConfirm(i18next.t("vehicle.msg_confirm_delete", { name: obj_name }))) {
                vehicleDelete(obj_id, did);
            }
        });

        $(document).on("click", "#vehicle_list .icon-edit", function () {
            obj_id = parseInt($(this).attr("obj_id"));
            did = $(this).attr("did");
            vehicleInfo(obj_id);
        });


        $(document).on("click", "#vehicle_list .icon-list-alt", function () {
            device_id = $(this).attr("device_id");
            logInfo(device_id);
        });

        $(document).on("click", "#vehicle_list .icon-retweet", function () {
            obj_id = parseInt($(this).attr("obj_id"));
            obj_name = $(this).attr("obj_name");
            did = $(this).attr("did");
            var title = i18next.t("vehicle.change_parent");
            $("#divCustomerAssign").dialog("option", "title", title);
            $("#divCustomerAssign").dialog("open");
        });

        //$(document).on("dblclick", "#customer_list li", function () {
        //    // 获取客户信息
        //    cust_id = parseInt($(this).attr("cust_id"));
        //    customerInfo(cust_id);
        //});

        $("#searchCustomer").click(function () {
            // customerQuery();
            var treeObj = $.fn.zTree.getZTreeObj("customerTree");
            var node = treeObj.getNodeByParam("name", $('#customerKey').val(), null);
            treeObj.selectNode(node);
            $('#selCustName').html(node.name);
            vehicleQuery(node.id, '');
        });

        $("#checkAll").click(function () {
            //alert($('#checkAll').prop("checked"));
            $("[type='checkbox']").prop("checked", $('#checkAll').prop("checked"));//全选
        });

        $("#searchVehicle").click(function () {
            vehicleQuery(uid, tree_path);
        });

        $('#searchKey').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                customerQuery();
                return false;
            }
        });

        $('#vehicleKey').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                vehicleQuery(uid, tree_path);
                return false;
            }
        });

        $("#bind").click(function () {
            var device_id = $('#device_id').val();     //终端ID
            var obj_name = $('#obj_name').val();   //车牌号码
            var query_json = {
                objectId: obj_id
            };
            var update_json = {
                did: device_id.trim()
            };
            wistorm_api._update('vehicle', query_json, update_json, auth_code, true, function (json) {
                if (json.status_code == 0) {
                    var uids = uid;
                    if (tree_path != '' && tree_path) {
                        uids = tree_path.split(',').filter(function (item) { return item !== '' }).join('|');
                    }
                    // 更新设置的vehicleId和vehicleName
                    var now = new Date();
                    var update = {
                        vehicleId: obj_id,
                        vehicleName: obj_name,
                        binded: true,
                        bindDate: now.format('yyyy-MM-dd hh:mm:ss'),
                        uid: '+' + uids
                    };
                    updateDevice(device_id, update, function (dev) {
                        if (dev.status_code == 0) {
                            _ok(i18next.t("vehicle.msg_bind_success"));
                            $('#device_id').attr("disabled", "disabled");
                            $('#bind').css("display", "none");
                            $('#unbind').css("display", "inline-block");
                            vehicleQuery(uid, tree_path);
                        } else {
                            _alert(i18next.t("vehicle.msg_bind_fail"), 2);
                        }
                    });
                } else {
                    _alert(i18next.t("vehicle.msg_bind_fail"), 2);
                }
            });
        });

        $("#unbind").click(function () {
            if (!CloseConfirm(i18next.t("vehicle.msg_confirm_unbind"))) {
                return;
            }
            var device_id = $('#device_id').val();     //终端ID
            var query_json = {
                objectId: obj_id
            };
            var update_json = {
                did: ''
            };
            wistorm_api._update('vehicle', query_json, update_json, auth_code, true, function (json) {
                if (json.status_code == 0) {
                    // 更新设置的vehicleId和vehicleName
                    var update = {
                        vehicleId: '',
                        vehicleName: '',
                        binded: false,
                        uid: '-' + uid
                    };
                    updateDevice(device_id, update, function (dev) {
                        if (dev.status_code == 0) {
                            _ok(i18next.t("vehicle.msg_unbind_success"));
                            $('#device_id').val('');
                            $('#device_id').removeAttr("disabled");
                            $('#bind').css("display", "inline-block");
                            $('#unbind').css("display", "none");
                            vehicleQuery(uid, tree_path);
                        } else {
                            _alert(i18next.t("vehicle.msg_unbind_fail"), 2);
                        }
                    });
                } else {
                    _alert(i18next.t("vehicle.msg_unbind_fail"), 2);
                }
            });
        });

        $("#addVehicle").click(function () {
            if (uid == 0) {
                _alert(i18next.t("system.select_customer"));
                return;
            }
            var service_end_date = new Date();
            service_end_date = new Date(Date.parse(service_end_date) + (86400000 * 31));
            service_end_date = service_end_date.format("yyyy-MM-dd");
            var title = i18next.t("vehicle.add_vehicle", { cust_name: cust_name });
            initFrmVehicle(title, 1, "", "", "", "", "", "", "", "", service_end_date);
            validator_vehicle.resetForm();
            $("#divVehicle").dialog("open");
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmCustomerList').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            $(this).dialog("close");
        };
        // 更换所属用户窗口
        $('#divCustomerList').dialog({
            autoOpen: false,
            width: 650,
            buttons: buttons
        });

        $('#frmCustomerList').submit(function () {
            var obj_id = parseInt($("#change_obj_id").val());
            var cust_id = parseInt($("#change_cust_id").val());
            var did = $("#change_did").val();
            vehicleChangeCustomer(obj_id, cust_id, did);
            return false;
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmVehicle').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            validator_vehicle.resetForm();
            $(this).dialog("close");
        };
        // Dialog Simple
        $('#divVehicle').dialog({
            autoOpen: false,
            width: 650,
            buttons: buttons
        });

        $('#frmVehicle').submit(function () {
            debugger;
            if ($('#frmVehicle').valid()) {
                if (vehicle_flag == 1) {
                    vehicleAdd();
                } else {
                    vehicleEdit();
                }
            }
            return false;
        });

        var buttons = {};
        buttons[i18next.t("system.change")] = function () {
            $('#frmCustomerAssign').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            $(this).dialog("close");
        };
        $('#divCustomerAssign').dialog({
            autoOpen: false,
            width: 480,
            buttons: buttons
        });

        $('#frmCustomerAssign').submit(function () {
            var msg = i18next.t("vehicle.msg_change_parent", { name: obj_name, assignName: assignName }); // '你确定将车辆[' + obj_name + ']的用户更换为[' + assignName + ']吗?';
            if (assignUid === $.cookie('dealer_id')) {
                msg = i18next.t("vehicle.msg_restore_parent", { name: obj_name }); // '你确定将车辆[' + obj_name + ']恢复到上级用户进行管理吗?';
            }
            if (CloseConfirm(msg)) {
                vehicleChangeCustomer(obj_id, assignUid, did);
            }
            return false;
        });

        var buttons = {};
        buttons[i18next.t("system.select")] = function () {
            $('#frmDepartAssign').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            $(this).dialog("close");
        };
        $('#divDepartAssign').dialog({
            autoOpen: false,
            width: 480,
            buttons: buttons
        });

        $('#frmDepartAssign').submit(function () {
            $('#depart_name').val(assignDepartName);
            $("#divDepartAssign").dialog("close");
            return false;
        });

        $("#selectDepart").click(function () {
            var title = i18next.t("system.depart");
            $("#divDepartAssign").dialog("option", "title", title);
            $("#divDepartAssign").dialog("open");
        });
        //为表单提供了强大的验证功能
        validator_vehicle = $('#frmVehicle').validate(
            {
                rules: {
                    obj_name: {
                        minlength: 4,
                        required: true,
                        remote: {
                            url: "/exists", //后台处理程序
                            type: "get", //数据发送方式
                            dataType: "json", //接受数据格式
                            data: {
                                auth_code: function () {
                                    return $.cookie('auth_code');
                                },
                                query_type: function () {
                                    return 4;
                                },
                                value: function () {
                                    return $('#obj_name').val();
                                },
                                old_value: function () {
                                    return edit_obj_name;
                                }
                            }
                        }
                    },
                    device_id: {
                        minlength: 6,
                        required: true,
                        remote: {
                            url: "exists", //后台处理程序
                            type: "get", //数据发送方式
                            dataType: "json", //接受数据格式
                            data: {
                                auth_code: function () {
                                    return $.cookie('auth_code');
                                },
                                query_type: function () {
                                    return 2;
                                },
                                value: function () {
                                    return $('#device_id').val();
                                },
                                uid: function () {
                                    return $.cookie('dealer_id');
                                }
                            }
                        }
                    },

                },
                messages: {
                    obj_name: { minlength: i18next.t("vehicle.name_minlength"), required: i18next.t("vehicle.name_required"), remote: i18next.t("vehicle.name_remote") },
                    device_id: { minlength: i18next.t("vehicle.id_minlength"), required: i18next.t("vehicle.id_required"), remote: i18next.t("vehicle.id_remote") },
                    sim: { rangelength: i18next.t("vehicle.sim_rangelength"), required: i18next.t("vehicle.sim_required"), remote: i18next.t("vehicle.sim_remote") }
                },
                highlight: function (element) {
                    $(element).closest('.control-group').removeClass('success').addClass('error');
                },
                success: function (element) {
                    element
                        .text('OK!').addClass('valid')
                        .closest('.control-group').removeClass('error').addClass('success');
                    //alert('success');
                }
            });

        customerQuery();
        deviceQuery();
        getAllDepart();
        clearInterval(id);
    }, 100);
});