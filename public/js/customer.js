/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */
// 客户详细信息
var customers = [];
var auth_code = $.cookie('auth_code');
var cust_id = 0;
var uid = 0;
var tree_path = '';
var customer_table;
var activeCustType;
var custType = '2';
var doing = false;
var selectNode = null;
var assignUid = 0;
var assignName = '';
var assignTreePath = '';

function windowResize() {
    var height = $(window).height() - 122;
    $('#customerTree').css({"height": height + "px"});
}

// 获取登陆用户的权限
var initRole = function () {
    var dealerId = $.cookie('dealer_id');
    var query_json = {
        uid: dealerId
    };
    $('#roleId').innerHTML = '';
    wistorm_api._list('role', query_json, 'objectId,name,remark,createdAt', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, false, function(roles){
        if(roles.status_code === 0 && roles.total > 0){
            for(var i = 0; i < roles.total; i++){
                var option = document.createElement('option');
                option.value = roles.data[i].objectId;
                option.innerText = roles.data[i].name;
                $('#roleId').append(option);
            }
        }
    });
};

var setRole = function(uid, roleId, callback){
    var query_json = {
        users: uid.toString()
    };
    var update_json = {
        users: "-" + uid.toString()
    };
    wistorm_api._update("role", query_json, update_json, auth_code, false, function(obj) {
        query_json = {
            objectId: parseInt(roleId)
        };
        update_json = {
            users: "%2B" + uid
        };
        wistorm_api._update("role", query_json, update_json, auth_code, false, function(obj) {
            callback(obj);
        });
    });
};

var getRole = function(uid, callback){
    var query_json = {
        users: uid.toString()
    };
    wistorm_api._get("role", query_json, "objectId", auth_code, false, function (obj) {
        if(obj.status_code == 0 && obj.data != null){
            callback(obj.data.objectId);
        }else{
            callback('');
        }
    })
};

var updateCustomerTree = function(cust_id, treePath, callback){
    wistorm_api.updateTree(cust_id, treePath, auth_code, callback);
};

// 车辆更换所属用户
var customerChangeParent = function(obj_id, change_cust_id, changeTreePath){
    var query_json = {
        uid: obj_id
    };
    var _treePath = changeTreePath + obj_id + ',';
    var update_json = {
        parentId: [change_cust_id],
        treePath: _treePath
    };
    wistorm_api._update('customer', query_json, update_json, auth_code, true, function(json){
        if(json.status_code === 0){
            $("#divCustomerAssign").dialog("close");
            updateCustomerCount(uid);
            updateCustomerCount(assignUid);
            customerQuery();
            getAllCustomer(uid);
            updateCustomerTree(obj_id, _treePath, function(json){
                if(json.status_code !== 0){
                    _alert(i18next.t("customer.err_change_parent"));
                }
            })
        }else{
            _alert(i18next.t("customer.err_change_parent"));
        }
    });
};

$(document).ready(function () {
    // Initialize placeholder
    // $.Placeholder.init();
    windowResize();
    $(window).resize(function () {
        windowResize();
    });

    var id = setInterval(function(){
        if(!i18nextLoaded){
            return;
        }

        $("#checkAll").click(function () {
            $("[type='checkbox']").prop("checked", $('#checkAll').prop("checked"));//全选
        });

        $(document).on("click", "#customer_list .icon-remove", function () {
            cust_id = parseInt($(this).attr("cust_id"));
            cust_name = $(this).attr("cust_name");
            if (CloseConfirm(i18next.t("customer.msg_delete_customer", { name: cust_name }))) {
                customerDelete(cust_id, uid);
            }
        });

        $(document).on("click", "#customer_list .icon-retweet", function () {
            cust_id = parseInt($(this).attr("cust_id"));
            cust_name = $(this).attr("cust_name");
            var title = i18next.t("customer.change_parent");
            $("#divCustomerAssign").dialog("option", "title", title);
            $("#divCustomerAssign").dialog("open");
        });

        $(document).on("click", "#customer_list .icon-edit", function () {
            cust_id = parseInt($(this).attr("cust_id"));
            customerInfo(cust_id);
        });

        // $("#searchcustomer").click(function () {
        //     customerQuery();
        // });

        activeCustType = $("#2")[0];
        $(document).on("click", ".custType", function () {
            if(activeCustType){
                activeCustType.classList.remove("active");
            }
            $(this)[0].classList.add("active");
            activeCustType = $(this)[0];
            custType = parseInt($(this).attr("id"));
            customerQuery();
        });

        $('#searchKey').keydown(function(e){
            var curKey = e.which;
            if(curKey == 13){
                customerQuery();
                return false;
            }
        });

        $('#customerKey').keydown(function(e){
            var curKey = e.which;
            if(curKey == 13){
                getAllCustomer(uid);
                return false;
            }
        });

        $("#addCustomer").click(function () {
            if(uid === 0){
                _alert(i18next.t("system.select_customer"));
                return;
            }
            var title = i18next.t("customer.add_customer");
            initFrmCustomer(title, 1, "", "", "", custType, "", "", "1", 0);
            validator_customer.resetForm();
            $("#divCustomer").dialog("open");
        });

        $("#addRole").click(function(){
            window.open('/role');
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmCustomer').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            validator_customer.resetForm();
            $(this).dialog("close");
        };
        $('#divCustomer').dialog({
            autoOpen: false,
            width: 550,
            buttons: buttons
        });

        $("#frmCustomer").submit(function () {
            if ($('#frmCustomer').valid()) {
                if (customer_flag == 1) {
                    customerAdd();
                } else {
                    customerEdit();
                }
            }
            return false;
        });

        buttons[i18next.t("system.save")] = function () {
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
            // debugger;
            var msg = i18next.t("customer.msg_change_parent", {cust_name: cust_name, assignName: assignName}); //'你确定将用户[' + cust_name + ']的上级用户更换为[' + assignName + ']吗?';
            if (assignUid === $.cookie('parent_id')) {
                msg = i18next.t("customer.msg_restore_parent", {cust_name: cust_name}); //'你确定将用户[' + cust_name + ']恢复到上级用户进行管理吗?';
            }
            if (cust_id.toString() === assignUid.toString()) {
                msg = i18next.t("customer.err_assign_me");
                _alert(msg, 3000);
                return false;
            }
            if (CloseConfirm(msg)) {
                // customerAssign();
                customerChangeParent(cust_id, assignUid, assignTreePath);
            }
            return false;
        });

        $("#resetPassword").click(function () {
            var new_password = hex_md5("123456");
            $('#password').val(new_password);
            $('#password2').val(new_password);
            _alert(i18next.t("customer.msg_restore_password"));
        });

        validator_customer = $('#frmCustomer').validate(
            {
                rules: {
                    username: {
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
                                    return 6;
                                },
                                value: function () {
                                    return $('#username').val();
                                }
                            }
                        }
                    },
                    password: {
                        minlength: 6,
                        required: true
                    },
                    password2: {
                        minlength: 6,
                        required: true,
                        equalTo: "#password"
                    },
                    cust_name: {
                        minlength: 2,
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
                                    return 5;
                                },
                                old_value: function () {
                                    return edit_cust_name;
                                },
                                value: function () {
                                    return $('#cust_name').val();
                                }
                            }
                        }
                    },
                    roleId: {
                        required: true
                    }
                },
                messages: {
                    username: {minlength: i18next.t("customer.username_minlength"), required: i18next.t("customer.username_required"), remote: i18next.t("customer.username_remote")},
                    password: {minlength: i18next.t("customer.password_minlength"), required: i18next.t("customer.password_required")},
                    password2: {required: i18next.t("customer.password2_required"), minlength: i18next.t("customer.password2_minlength"), equalTo: i18next.t("customer.password2_equalTo")},
                    cust_name: {minlength: i18next.t("customer.cust_name_minlength"), required: i18next.t("customer.cust_name_required"), remote: i18next.t("customer.cust_name_remote")},
                    roleId: {required: i18next.t("customer.roleId_required")}
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
        getAllCustomer($.cookie('dealer_id'));

        initRole();

        clearInterval(id);
    }, 100);
});

function customerInfo(objectId){
    // var searchUrl = $.cookie('Host') + "customer/" + cust_id;
    // var searchData = { auth_code:auth_code };
    // var searchObj = { type:"GET", url:searchUrl, data:searchData, success:function (json) {
    //     customerInfoSuccess(json);
    // }, error:OnError };
    // ajax_function(searchObj);
    var query_json = {
        uid: objectId
    };
    wistorm_api._get('customer', query_json, 'objectId,uid,name,custType,custTypeId,parentId,contact,tel,createdAt,updatedAt', auth_code, true, function(json){
        query_json = {
            objectId: json.data.uid
        };
        wistorm_api.get(query_json, 'username,mobile,email,password,userType', auth_code, function(user){
            json.data.username = user.data.username || user.data.mobile || user.data.email;
            json.data.password = '****************';
            json.data.userType = user.data.userType;
            getRole(objectId, function(roleId){
                json.data.roleId = roleId;
                customerInfoSuccess(json.data);
            });
        });
    });
}

var customerInfoSuccess = function(json) {
    //alert(json);
    validator_customer.resetForm();
    var create_time = new Date(json.createdAt);
    create_time = create_time.format("yyyy-MM-dd hh:mm:ss");
    initFrmCustomer(i18next.t("customer.edit_customer"), 2, json.username, json.password, json.name, json.custType, json.contact, json.tel, create_time, json.roleId);
    $("#divCustomer").dialog("open");
};

// 初始化客户信息窗体
var initFrmCustomer = function(title, flag, username, password, cust_name, cust_type, contacter, contacter_tel, create_time, roleId){
    $("#divCustomer").dialog("option", "title", title);
    customer_flag = flag;
    $('#username').val(username);
    $('#password').val(password);
    $('#password2').val(password);
    edit_cust_name = cust_name;
    $('#cust_name').val(cust_name);
    $('#cust_type').val(cust_type.toString());
    $('#roleId').val(roleId.toString());
    $('#contacter').val(contacter);
    $('#contacter_tel').val(contacter_tel);
    $('#create_time').val(create_time);
    if(customer_flag == 1){
        $('#username').removeAttr("disabled");
        $('#password').removeAttr("disabled");
        $('#password_bar').show();
        $('#password_bar2').show();
        $('#create_time_bar').hide();
        $('#resetPassword').hide();
    }else{
        $('#username').attr("disabled","disabled");
        $('#password').attr("disabled","disabled");
        $('#password_bar2').hide();
        $('#create_time_bar').show();
        $('#resetPassword').show();
    }
};


// node = {label: "", id: 0, children: []};
// 客户查询
// function customerQuery() {
//     var dealer_type = $.cookie('dealer_type');
//     var dealer_id = $.cookie('dealer_id');
//     var tree_path = $.cookie('tree_path');
//     var key = '';
//     if($('#customerKey').val() != '搜索用户'){
//         key = $('#customerKey').val();
//     }
//     var page_no = 1;
//     var page_count = 1000;
//
//     var query_json;
//     if(key != ""){
//         query_json = {
//             parentId: dealer_id,
//             custType: custType,
//             name: '^' + key
//         };
//     }else{
//         query_json = {
//             parentId: dealer_id,
//             custType: custType
//         };
//     }
//     setLoading("customer_list");
//     wistorm_api._list('customer', query_json, 'objectId,name,contact,tel,treePath,parentId,uid,createdAt', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, true, customerQuerySuccess)
// }

function customerQuery() {
    var dealer_type = $.cookie('dealer_type');
    var dealer_id = $.cookie('dealer_id');
    var tree_path = $.cookie('tree_path');
    var key = '';
    if($('#searchKey').val() !== ''){
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
    if(key !== ""){
        query_json = {
            treePath: '^' + tree_path,
            name: '^' + key
        };
    }else{
        query_json = {
            treePath: '^' + tree_path
            // parentId: dealer_id
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
        // cust_name = json.data[0].name;
        // cust_id = json.data[0].objectId;
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
        if(parseInt(treeNode.id) > 100){
            uid = treeNode.id;
            tree_path = treeNode.treePath;
            selectNode = treeNode;
            $.cookie('uid', uid);
            cust_name = treeNode.name;
            $('#selCustName').html(cust_name);
            getAllCustomer(uid);
        }
    };

    var onCustomerAssignClick = function(event, treeId, treeNode){
//        alert(treeNode.tree_path);
        if(parseInt(treeNode.id) > 100){
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
    // customerArray.push({
    //     open: true,
    //     id: $.cookie('dealer_id'),
    //     treePath: $.cookie('tree_path'),
    //     pId: 0,
    //     name: '我的用户',
    //     icon: '/img/customer.png'
    // });
    // selectArray.push({
    //     open: true,
    //     id: $.cookie('dealer_id'),
    //     treePath: $.cookie('tree_path'),
    //     pId: 0,
    //     name: '恢复到上级用户',
    //     icon: '/img/restore.png'
    // });
    // uid = $.cookie('dealer_id');
    // tree_path = $.cookie('tree_path');
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
        var childCount = json.data[i]['other'] ? (json.data[i]['other']['childCount'] || 0): 0;
        var vehicleCount = json.data[i]['other'] ? (json.data[i]['other']['vehicleCount'] || 0): 0;
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
        if(typeof getAllCustomer != "undefined"){
            getAllCustomer(uid);
        }
    }
};

var getAllCustomer = function (uid) {
    var key = '';
    if($('#customerKey').val() !== ''){
        key = $('#customerKey').val().trim();
    }
    var query_json;
    if(key !== ""){
        var searchType = $('#searchType').val();
        if($('#allNode').is(':checked')) {
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
                wistorm_api._list('customer', query_json, 'custType,uid,name,other,createdAt,contact,tel,parentId', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, querySuccess);
            });
        }else{
            query_json = {
                parentId: uid
            };
            query_json[searchType] = '^' + key;
        }
    }else{
        query_json = {
            parentId: uid
        };
    }
    // wistorm_api._list('customer', query_json, 'objectId,name,treePath,parentId,uid,custType,other', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, customerQuerySuccess)
    wistorm_api._list('customer', query_json, 'custType,uid,name,other,createdAt,contact,tel,parentId', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, querySuccess);
};

var querySuccess = function(json) {
    var custTypeDesc = {
        '2': i18next.t("system.dealer"),
        '7': i18next.t("system.personal"),
        '8': i18next.t("system.company")
    };
    var j, _j, UnContacter, Uncontacter_tel;
    // 更新选中node显示
    if(json.status_code === 0 && selectNode && selectNode.id !== $.cookie('dealer_id')){
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        selectNode.name = selectNode._name + '(' + json.total + '/' + selectNode.vehicleCount + ')';
        treeObj.updateNode(selectNode);
    }
    names = [];
    for (var i = 0; i < json.data.length; i++) {
        json.data[i].createdAt = new Date(json.data[i].createdAt);
        json.data[i].createdAt = json.data[i].createdAt.format("yyyy-MM-dd");
        json.data[i].custTypeDesc = custTypeDesc[json.data[i].custType];
        json.data[i].contact = json.data[i].contact || '';
        json.data[i].tel = json.data[i].tel || '';
        json.data[i].childCount = json.data[i].other ? json.data[i].other.childCount || 0: 0;
        json.data[i].vehicleCount = json.data[i].other ? json.data[i].other.vehicleCount || 0: 0;
        names.push(json.data[i].name);
    }

    var _columns = [
        // { "mData":null, "sClass":"center", "bSortable":false, "fnRender": function(obj){
        //     return "<input type='checkbox' value='" + obj.aData.objectId + "'>";
        // }
        // },
        { "mData":"name", "sClass":"ms_left" },
        { "mData":"custTypeDesc", "sClass":"center" },
        { "mData":"contact", "sClass":"center" },
        { "mData":"tel", "sClass":"center" },
        { "mData":"childCount", "sClass":"center" },
        { "mData":"vehicleCount", "sClass":"center" },
        { "mData":"createdAt", "sClass":"center"},
        { "mData":null, "sClass":"center", "bSortable":false, "fnRender":function (obj) {
            return "<a href='#' title='" + i18next.t("table.edit") + "'><i class='icon-edit' cust_id='" + obj.aData.uid + "'></i></a>&nbsp&nbsp<a href='#' title='" + i18next.t("table.change_parent") + "'><i class='icon-retweet' cust_id='" + obj.aData.uid + "' cust_name='" + obj.aData.name + "'></i></a>&nbsp&nbsp<a href='#' title='" + i18next.t("table.delete") + "'><i class='icon-remove' cust_id='" +
                obj.aData.uid + "' cust_name='" + obj.aData.name + "'></i></a>";
        }
        }
    ];
    var lang = i18next.language || 'en';
    var objTable = {
        "bInfo":false,
        "bLengthChange":false,
        "bProcessing":true,
        "bServerSide":false,
        "bFilter":false,
        "aaData":json.data,
        "aoColumns":_columns,
        "sDom":"<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType":"bootstrap",
        "oLanguage":{"sUrl":'css/' + lang + '.txt'}
    };
    //$('#vehicleKey').typeahead({source:names});

    $('#searchKey').typeahead({
        source: function (query, process) {
            process(names);
        }
    });

    if (customer_table) {
        customer_table.fnClearTable();
        customer_table.fnAddData(json.data);
    } else {
        customer_table = $("#customer_list").dataTable(objTable);
        localize = locI18next.init(i18next);
        localize('.table');
    }

    if($("#customerKey").val() !== '' && json.data.length === 1){
        var treeObj = $.fn.zTree.getZTreeObj("customerTree");
        var node = treeObj.getNodeByParam("id", json.data[0].parentId[0], null);
        if(node){
            cust_name = node.name;
            $('#selCustName').html(cust_name);
            treeObj.selectNode(node);
        }
    }
};

var getStyle = function(level){
    var style = "padding-left: " + (level - 1) * 10 + "px";
    return style;
};

// 新增客户
var customerAdd = function(){
    if(doing){
        return;
    }
    if(uid === 0){
        msgShow($.t("system.select_customer"));
        return;
    }
    doing = true;
    // var dealer_id = $.cookie('dealer_id');
    var parent_cust = getLocalCustomerInfo($('#parent_cust_id').val());
    var parent_cust_id = 1;
    var parent_tree_path = ",1,";
    var parent_level = 0;
    if(parent_cust){
        parent_cust_id = parent_cust.cust_id;
        parent_tree_path = parent_cust.tree_path;
        parent_level = parent_cust.level;
    }

    var cust_name = $('#cust_name').val(); //用户名称，只有当用户类型为集团用户时有效，需判断用户名是否存在
    var cust_type = $('#cust_type').val(); //个人用户为1，集团用户为2
    var contacter = $('#contacter').val(); //姓名
    var username = $('#username').val();
    var roleId = $('#roleId').val();
    var password = hex_md5($("#password").val());
    var contacter_tel = $('#contacter_tel').val();  //手机号码
    var province = 1;  //从字典表中获取dict_type=province
    var city = 1;     //从字典表中获取dict_type=city
    var reg_rule = {
        fee_type: { price: 120, period: 12 },
        mdt_type: { mdt_name: "WISE", protocol_ver: "1.0", fittings: ",60,61,64,63,65,", channel: 2 },
        card_type: 1,
        first_interval: 12
    };
    var send_type = 0;
    var roles = [1];
    var update_time = new Date();

    // var sendUrl = $.cookie('Host') + "customer?access_token=" + auth_code;
    // var sendData = { dealer_id: dealer_id, cust_name: cust_name, cust_type: cust_type, parent_cust_id: parent_cust_id, contacter: contacter, contacter_tel: contacter_tel, province: province, city: city, reg_rule: reg_rule, send_type: send_type, tree_path: parent_tree_path, level: parent_level, roles: roles, users: users };
    // var sendObj = { type:"POST", url:sendUrl, data:sendData, success:function (json) {
    //     customerAddSuccess(json);
    // }, error:OnError };
    // ajax_function(sendObj);
    wistorm_api.create(username, username, '', password, cust_type, 2, uid, {}, auth_code, function (obj) {
        if(obj.status_code == 0 && obj.uid){
            var create_json = {
                name: cust_name,
                parentId: [uid.toString()],
                custType: cust_type,
                contact: contacter,
                tel: contacter_tel,
                treePath: tree_path + obj.uid + ',',
                uid: obj.uid
            };
            wistorm_api._create('customer', create_json, auth_code, true, customerAddSuccess);
            setRole(obj.uid, roleId, function(obj){
            });
            // 更新下级用户数
            updateCustomerCount(uid.toString());
        }else{
            _alert(i18next.t("customer.msg_add_fail"));
            doing = false;
        }
    });
};

var customerAddSuccess = function(json) {
    if(json.status_code == 0){
        $("#divCustomer").dialog("close");
        getAllCustomer(uid);
    }else{
        _alert(i18next.t("customer.msg_add_fail"));
    }
    doing = false;
};

// 编辑客户
var customerEdit = function(){
    var auth_code = $.cookie('auth_code');
    var parent_cust = getLocalCustomerInfo($('#parent_cust_id').val());
    var parent_cust_id = 1;
    var parent_tree_path = ",1,";
    var parent_level = 0;
    if(parent_cust){
        parent_cust_id = parent_cust.cust_id;
        parent_tree_path = parent_cust.tree_path;
        parent_level = parent_cust.level;
    }
    var cust_name = $('#cust_name').val(); //用户名称，只有当用户类型为集团用户时有效，需判断用户名是否存在
    var cust_type = $('#cust_type').val(); //个人用户为1，集团用户为2
    var contacter = $('#contacter').val(); //姓名
    var contacter_tel = $('#contacter_tel').val();  //手机号码
    var roleId = $('#roleId').val();
    var password = $("#password").val();
    var province = 1;  //从字典表中获取dict_type=province
    var city = 1;     //从字典表中获取dict_type=city
    var reg_rule = {
        fee_type: { price: 120, period: 12 },
        mdt_type: { mdt_name: "WISE", protocol_ver: "1.0", fittings: ",60,61,64,63,65,", channel: 2 },
        card_type: 1,
        first_interval: 12
    };
    var send_type = 0;
    var roles = [1];
    var update_time = new Date();
    var users = [{
        "user_name": $('#username').val(),
        "password": $("#password").val()
    }];

    // var sendUrl = $.cookie('Host') + "customer/" + cust_id + "?access_token=" + auth_code;
    // var sendData = { cust_name: cust_name, cust_type: cust_type, parent_cust_id: parent_cust_id, contacter: contacter, contacter_tel: contacter_tel, province: province, city: city, reg_rule: reg_rule, send_type: send_type, parent_tree_path: parent_tree_path, level: parent_level, roles: roles, users: users };
    // var sendObj = { type:"PUT", url:sendUrl, data:sendData, success:function (json) {
    //     customerEditSuccess(json);
    // }, error:OnError };
    // ajax_function(sendObj);
    var query_json = {
        uid: cust_id
    };
    var update_json = {
        custType: cust_type,
        name: cust_name,
        contact: contacter,
        tel: contacter_tel
    };
    wistorm_api._update('customer', query_json, update_json, auth_code, true, function(json){
        if(json.status_code === 0){
            var query_json = {
                objectId: cust_id
            };
            var update_json = {
                userType: cust_type
            };
            if(password !== '****************'){
                update_json.password = password;
            }
            wistorm_api.update(query_json, update_json, auth_code, customerEditSuccess);
        }else{
            _alert(i18next.t("customer.msg_edit_fail"));
        }
    });
    setRole(cust_id, roleId, function(obj){
    });
};

var customerEditSuccess = function(json) {
    if(json.status_code == 0){
        $("#divCustomer").dialog("close");
        getAllCustomer(uid);
    }else{
        _alert(i18next.t("customer.msg_edit_fail"));
    }
};

// 删除客户
var customerDelete = function(cust_id, uid){
    // var auth_code = $.cookie('auth_code');
    // var sendUrl = $.cookie('Host') + "customer/" + cust_id + "?access_token=" + auth_code;
    // var sendData = { tree_path: tree_path };
    // var sendObj = { type:"DELETE", url:sendUrl, data:sendData, success:function (json) {
    //     customerDeleteSuccess(json);
    // }, error:OnError };
    // ajax_function(sendObj);
    //判断下属是否有用户，如果有，不能删除用户
    var query_json = {
        parentId: cust_id
    };
    wistorm_api._count('customer', query_json, auth_code, true, function(obj){
       if(obj.count > 0){
           _alert(i18next.t("customer.msg_have_customer"));
       }else{
           //判断下属是否有车辆，如果有，不能删除用户
           var query_json = {
               uid: cust_id
           };
           wistorm_api._count('vehicle', query_json, auth_code, true, function(obj){
               if(obj.count > 0){
                   _alert(i18next.t("customer.msg_have_vehicle"));
               }else{
                   wistorm_api._delete('customer', query_json, auth_code, true, function(obj){
                       if(obj.status_code == 0){
                           var query_json = {
                               objectId: cust_id
                           };
                           wistorm_api.delete(query_json, auth_code, customerDeleteSuccess);
                           // 更新下级用户数
                           updateCustomerCount(uid);
                       }
                   });
               }
           });
       }
    });
};

var customerDeleteSuccess = function(json) {
    if(json.status_code == 0){
        getAllCustomer(uid);
    }else if(json.status_code == 7){
        _alert(i18next.t("customer.msg_have_vehicle"));
    }else{
        _alert(i18next.t("customer.msg_delete_fail"));
    }
};

// 获取客户信息
var getLocalCustomerInfo = function(cust_id){
    var customer = {};
    for (var i = 0; i < customers.length; i++) {
        if(customers[i].objectId == cust_id){
            customer = customers[i];
            return customer;
        }
    }
};

var searchLocalCustomerInfoByName = function(cust_name){
    var customer = {};
    for (var i = 0; i < customers.length; i++) {
        if(customers[i].cust_name.indexOf(cust_name) > -1){
            customer = customers[i];
            return customer;
        }
    }
};