/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */

if ($.cookie('lang') === 'zh' || $.cookie('lang') === 'zh-CN') {
    document.write('<script type="text/javascript" src="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>');
}

var _flag = 1;   //1: 新增  2: 修改
var _validator;
var _table;
var _tableGeofence;
var _id = 0;
var _name = '';
var _createdAt = '';
var _remark = '';
var lon = parseFloat($.cookie("lon")) || 113.84714;
var lat = parseFloat($.cookie("lat")) || 22.67805;
var drawingManager;
var auth_code = $.cookie('auth_code');
var updateTime = new Date(0);
var names = [];
var vehicles = [];
var _vehicles = {};
var _firstLoad = true;
var typeDesc; // = ['', '兴趣点', '多边形', '折线', '圆形'];
var actionDesc; // = ['进出', '进', '出'];
var map_type = MAP_TYPE_BAIDU;
var map_engine = 'BAIDU';

// 围栏查询
function _queryGeofence(key) {
    var query_json;
    if(key && key != ""){
        query_json = {
            uid: $.cookie('dealer_id'),
            name: '^' + key
        };
    }else{
        query_json = {
            uid: $.cookie('dealer_id')
        };
    }
    wistorm_api._list('overlay', query_json, 'objectId,name,type,remark,createdAt,vehicleCount', '-createdAt', '-createdAt', 0, 0, 1, -1, auth_code, true, function(json){
        var _columns = [
            {
                "searchable": false,
                "data": null,
                "className": "center did",
                "bSortable": false,
                "render": function (obj) {
                    return "<input type='checkbox' id='" + obj.objectId + "' value='" + obj.objectId + "' name='" + obj.name + "' title='" + i18next.t("geofence.check") +"'>";
                }
            },
            {"searchable": false, "data": null, "className": "", "render": function (obj) {
                return '<span class="name" title="' + i18next.t("geofence.dblclick_edit") +'">' + obj.name + '</span>';
            }},
            {
                "searchable": false, "data": null, "className": "center", "render": function (obj) {
                return '<span title="' + i18next.t("geofence.dblclick_edit") +'">' + typeDesc[obj.type] + '</span>';
            }
            },
            {
                "searchable": false, "data": null, "className": "center", "render": function (obj) {
                return '<span title="' + i18next.t("geofence.dblclick_edit") +'">' + new Date(obj.createdAt).format('yyyy-MM-dd') + '</span>';
            }
            },
            {
                "searchable": false, "data": null, "className": "center", "render": function (obj) {
                    var vehicleCount = obj.vehicleCount || 0;
                return '<a class="vehicleCount" id="' + obj.objectId + '" name="' + obj.name +'" title="' + i18next.t("geofence.click_bind") +'">' + vehicleCount +'</a>';
            }
            }
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
            "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": {"sUrl": 'css/' + lang + '.txt'}
        };

        if (_tableGeofence) {
            _tableGeofence.fnClearTable();
            if (json.data.length > 0) {
                _tableGeofence.fnAddData(json.data);
            }
        } else {
            _tableGeofence = $("#geofenceList").dataTable(objTable);
            $('#geofenceList tbody').on('click', 'tr', function () {
                if ($(this).hasClass('selected')) {
                    // $(this).removeClass('selected');
                }
                else {
                    _tableGeofence.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
                _id = $(this).find(".did [type='checkbox']").val();
                _name = $(this).find(".name").html();
                // findGeofence(id);
                $("#binded").prop("checked", true);
                setAssignButton();
                _query();
            });
            $('#geofenceList tbody').on('click', 'tr', function () {
                if ($(this).hasClass('selected')) {
                    // $(this).removeClass('selected');
                }
                else {
                    _tableGeofence.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
                _id = $(this).find(".did [type='checkbox']").val();
                _name = $(this).find(".name").html();
                findGeofence(_id);
            });
            $('#geofenceList tbody').on('mouseover', 'tr', function () {
                $(this).css("cursor","pointer");
            });
            $('#geofenceList tbody').on('mouseout', 'tr', function () {
                $(this).css("cursor","default");
            });
        }
    });
}

function findGeofence(id) {
    _id = id;
    var query_json = {
        objectId: id
    };
    wistorm_api._get('overlay', query_json, 'objectId,type,name,points,remark,opt,createdAt', auth_code, true, function(json){
        if(json.data){
            var radius = json.data.opt ? json.data.opt.radius || 0 : 0;
            var points = json.data.points;
            _type = json.data.type;
            _overlay = wimap.addOverlay(_type, points, radius, function(type, target){
                //'半径：' + type.target.getRadius().toFixed(0) + '米'
                $('#typeInfo').html(i18next.t("geofence.radius", {radius: type.target.getRadius().toFixed(0)}));
            });
            var cp;
            if(_type === 4){
                cp = _overlay.getCenter();
            }else if(_type === 2){
                if(map_type === MAP_TYPE_BAIDU){
                    cp = _overlay.getBounds().getCenter();
                }else {
                    var bounds = new google.maps.LatLngBounds();
                    var polygonCoords = _overlay.getPath().getArray();
                    for (i = 0; i < polygonCoords.length; i++) {
                        bounds.extend(polygonCoords[i]);
                    }
                    cp = bounds.getCenter();
                }
            }
            if(map_type === MAP_TYPE_BAIDU){
                wimap.setCenter(cp.lng, cp.lat);
            }else{
                wimap.setCenter(cp.lng(), cp.lat());
            }
            // 打开编辑框
            // var createdAt = new Date(json.data.createdAt).format('yyyy-MM-dd hh:mm:ss');
            // initFrmGeofence(i18next.t("geofence.edit_geofence"), 2, json.data.name, '', json.data.remark, createdAt);
            // if(_type === 4){
            //     $('#type').val(i18next.t("geofence.circle"));
            //     $('#typeInfo').html(i18next.t("geofence.radius", {radius: _overlay.getRadius().toFixed(0)}));
            // }else if(_type === 2){
            //     $('#type').val(i18next.t("geofence.polygon"));
            //     $('#typeInfo').html('');
            // }
            // $("#divGeofence").dialog("open");
            // drawingManager.show();
            _name = json.data.name;
            _createdAt = json.data.createdAt;
            _remark = json.data.remark;
        }
    });
}

// 设备查询
function _query(key, sort) {
    var query_json;
    var binded = $('#binded').prop("checked");
    if(key && key != ""){
        query_json = {
            uid: $.cookie('dealer_id'),
            vehicleName: '^' + key
        };
    }else{
        query_json = {
            uid: $.cookie('dealer_id')
        };
    }
    if(!sort){
        sort = 'vehicleName';
    }
    if(binded){
        query_json['geofences.id'] = _id;
    }
    wistorm_api._list('_iotDevice', query_json, 'objectId,vehicleId,vehicleName,did,geofences', 'vehicleName', 'vehicleName', 0, 0, 1, -1, auth_code, true, querySuccess);
}

var setAssignButton = function(){
    $('#assignDevices').attr('disabled', $("#binded").prop("checked"))
};

var isBinded = function(geofences, id){
    var s = JSON.stringify(geofences);
    return s.indexOf(id) > -1;
};

var querySuccess = function(json) {
    var j, _j, UnContacter, Uncontacter_tel;
    // vehicles = json.data;
    for (var i = 0; i < json.data.length; i++) {
        json.data[i].status = '0';
    }

    var binded = $('#binded').prop('checked');
    if(!binded){
        json.data = json.data.filter(function(obj){
            return !isBinded(obj.geofences, _id);
        });
    }

    var _columns = [
        {
            "searchable": false, "data": null, "className": "center did", "bSortable": false, "render": function (obj) {
            return isBinded(obj.geofences, _id) ? "<input type='checkbox' id='" + obj.did + "' value='" + obj.did + "' name='" + (obj.vehicleName||obj.did) + "' title='" + i18next.t("geofence.check") +"' checked>":"<input type='checkbox' id='" + obj.did + "' value='" + obj.did + "' name='" + (obj.vehicleName||obj.did) + "' title='" + i18next.t("geofence.check") +"'>";
        }
        },
        {
            "searchable": false, "data": null, "className": "", "render": function (obj) {
                if(obj.vehicleName){
                    return '<div style="width:150px;overflow:hidden;white-space:nowrap; text-overflow:ellipsis" title="' + obj.vehicleName + '">' + obj.vehicleName + '</div>';
                }else{
                    var name = obj.did;
                    return '<div style="width:150px;overflow:hidden;white-space:nowrap; text-overflow:ellipsis" title="' + name + '">' + name + '</div>';
                }
        }
        },
        {"searchable": false, "data": null, "className": "center", "render": function (obj) {
            return isBinded(obj.geofences, _id) ? actionDesc[obj.geofences[0].type] : '';
        }
        },
        {"searchable": false, "data": null, "className": "center", "render": function (obj) {
            var geoCount = obj.geofences ? obj.geofences.length || 0: 0;
            return '<a class="geoCount" id="' + obj.did + '" name="' + obj.vehicleName +'" title="' + i18next.t("geofence.click_geofence") +'">' + geoCount +'</a>';
        }},
        {"searchable": false, "data": null, "className": "center", "render": function (obj) {
            return isBinded(obj.geofences, _id) ? '<i did="' + obj.did +'" actionType="' + obj.geofences[0].type +'" class="unbinded icon-remove" title="' + i18next.t("geofence.delete_bind") +'"></i>': '';
        }}
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
        "sDom": "<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": {"sUrl": 'css/' + lang + '.txt'}
    };

    if (_table) {
        _table.fnClearTable();
        if (json.data.length > 0) {
            _table.fnAddData(json.data);
        }
    } else {
        _table = $("#vehicleList").dataTable(objTable);
        $('#vehicleList tbody').on('dblclick', 'tr', function () {
            var did = $(this).find(".did [type='checkbox']").val();
            var query = {
                did: did,
                map: map_engine
            };
            wistorm_api._get('_iotDevice', query, 'vehicleName, activeGpsData', auth_code, true, function(json){
                if(json.status_code === 0 && json.data && json.data.activeGpsData){
                    var vehicleName = json.data.vehicleName || did;
                    wimap.addStartMarker(json.data.activeGpsData.lon, json.data.activeGpsData.lat, vehicleName);
                    wimap.setCenter(json.data.activeGpsData.lon, json.data.activeGpsData.lat);
                }else{
                    _alert(i18next.t("geofence.no_valid_location"), 2);
                }
            });
        });
        $('#vehicleList tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
            }
            else {
                _table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });
        $('#vehicleList tbody').on('mouseover', 'tr', function () {
            $(this).css("cursor","pointer");
        });
        $('#vehicleList tbody').on('mouseout', 'tr', function () {
            $(this).css("cursor","default");
        });
    }
};

function windowResize() {
    //高度变化改变(要重新计算_browserheight)
    windowHeight = $(window).height() - 215;
    // 如果宽度小于390，则设置表格为简易显示模式，并且客户列表高度改为300px
    windowWidth = $(window).width();
}

// 初始化车辆信息窗体
var initFrmGeofence = function (title, flag, name, type, remark, createdAt) {
    $("#divGeofence").dialog("option", "title", title);
    _flag = flag;
    $('#name').val(name);
    $('#type').val(type);
    $('#remark').val(remark);
    if (_flag == 1) {
        $('#pnlDate').hide();
    } else {
        $('#createdAt').val(createdAt);
        $('#createdAt').attr("disabled", "disabled");
        $('#pnlDate').show();
    }
};

// 初始化关联信息窗体
var initFrmGeofenceAssign = function (title, overlayName, assginDevices) {
    $("#divGeofenceAssign").dialog("option", "title", title);
    $('#overlayName').val(overlayName);
    $('#assginDevices').val(assginDevices);
};

// 新增围栏
var _add = function () {
    var dealerId = $.cookie('dealer_id');
    var name = $("#name").val();
    var remark = $("#remark").val();
    var type = _type;
    var points = [];
    var _points = [];
    var loc = {};
    var opt = {};
    opt.mapType = map_engine;
    if(type == 4){
        opt.radius = _overlay.getRadius();
        if(map_type === MAP_TYPE_BAIDU){
            loc = { type: "Point", coordinates: [ _overlay.getCenter().lng, _overlay.getCenter().lat ] };
            _points.push([ _overlay.getCenter().lng, _overlay.getCenter().lat ]);
        }else{
            loc = { type: "Point", coordinates: [ _overlay.getCenter().lng(), _overlay.getCenter().lat() ] };
            _points.push([ _overlay.getCenter().lng(), _overlay.getCenter().lat() ]);
        }
    }else if(type === 2) {
        points = _overlay.getPath();
        if (map_type === MAP_TYPE_BAIDU) {
            for (var i = 0; i < points.length; i++) {
                _points.push([points[i].lng, points[i].lat]);
            }
        }else{
            points = points.getArray();
            for (var i = 0; i < points.length; i++) {
                _points.push([points[i].lng(), points[i].lat()]);
            }
        }
        if(map_type === MAP_TYPE_BAIDU) {
            _points.push([points[0].lng, points[0].lat]);
        }else{
            _points.push([points[0].lng(), points[0].lat()]);
        }
        loc = {
            type: "Polygon",
            coordinates: [ _points ]
        }
    }
    // var wistorm_api = new WiStormAPI(app_key, app_secret, 'json', '2.0', 'md5', dev_key);
    var create_json = {
        uid: dealerId,
        name: name,
        type: type,
        points: _points,
        opt: opt,
        loc: loc,
        remark: remark,
        createdAt: new Date()
    };
    wistorm_api._create('overlay', create_json, auth_code, true, function(json){
        if (json.status_code == 0) {
            $("#divGeofence").dialog("close");
            // wimap.map.clearOverlays();
            if(_overlay){
                wimap.removeOverlay(_overlay);
            }
            drawingManager.hide();
            _queryGeofence();
        } else {
            _alert(i18next.t("geofence.msg_add_fail"));
        }
    });
};

// 修改围栏
var _edit = function () {
    var name = $("#name").val();
    var remark = $("#remark").val();
    var type = _type;
    var points = [];
    var _points = [];
    var loc = {};
    var opt = {};
    opt.mapType = map_engine;
    if(type == 4){
        opt.radius = _overlay.getRadius();
        if(map_type === MAP_TYPE_BAIDU){
            loc = { type: "Point", coordinates: [ _overlay.getCenter().lng, _overlay.getCenter().lat ] };
            _points.push([ _overlay.getCenter().lng, _overlay.getCenter().lat ]);
        }else{
            loc = { type: "Point", coordinates: [ _overlay.getCenter().lng(), _overlay.getCenter().lat() ] };
            _points.push([ _overlay.getCenter().lng(), _overlay.getCenter().lat() ]);
        }
    }else if(type === 2){
        points = _overlay.getPath();
        if (map_type === MAP_TYPE_BAIDU) {
            for (var i = 0; i < points.length; i++) {
                _points.push([points[i].lng, points[i].lat]);
            }
        }else{
            points = points.getArray();
            for (var i = 0; i < points.length; i++) {
                _points.push([points[i].lng(), points[i].lat()]);
            }
        }
        if(map_type === MAP_TYPE_BAIDU) {
            _points.push([points[0].lng, points[0].lat]);
        }
        loc = {
            type: "Polygon",
            coordinates: [ _points ]
        }
    }
    var updatedAt = new Date();
    // var wistorm_api = new WiStormAPI(app_key, app_secret, 'json', '2.0', 'md5', dev_key);
    var query_json = {
        objectId: _id
    };
    var update_json = {
        name: name,
        type: type,
        points: _points,
        loc: loc,
        opt: opt,
        remark: remark,
        updatedAt: updatedAt
    };
    wistorm_api._update('overlay', query_json, update_json, auth_code, true, function(json){
        if (json.status_code == 0) {
            $("#divGeofence").dialog("close");
            // wimap.map.clearOverlays();
            if(_overlay){
                wimap.removeOverlay(_overlay);
            }
            drawingManager.hide();
            _queryGeofence();
        } else {
            _alert(i18next.t("geofence.msg_edit_fail"));
        }
    });
};

// 删除围栏
var _delete = function (_id) {
    var query_json = {
        objectId: _id
    };
    wistorm_api._delete('overlay', query_json, auth_code, true, function(json){
        if (json.status_code === 0) {
            var query_json = {
                'geofences.id': _id
            };
            var updatedAt = new Date().format('yyyy-MM-dd hh:mm:ss');
            var update_json = {
                'geofences.$.id': '-' + _id,
                'geoUpdatedAt': updatedAt
            };
            wistorm_api._updatePost('_iotDevice', query_json, update_json, auth_code, true, function(json) {
                if (json.status_code == 0) {
                } else {
                    // _alert(i18next.t("geofence.msg_delete_fail"));
                    console.log(i18next.t("geofence.msg_delete_fail"));
                }
                if(_overlay){
                    wimap.removeOverlay(_overlay);
                }
                _queryGeofence();
                _query();
            });
        } else {
            _alert(i18next.t("geofence.msg_delete_fail"));
        }
    });
};

// 分配围栏
var _assign = function(){
    if(_id === 0){
        _alert(i18next.t("geofence.msg_select_geofence"));
        return;
    }
    var query_json = getAssignDevices();
    var add_json = {
        id: _id,
        type: parseInt($('#actionType').val())
    };
    var updatedAt = new Date().format('yyyy-MM-dd hh:mm:ss');
    var update_json = {
        'geofences': '+' + JSON.stringify(add_json),
        'geoUpdatedAt': updatedAt
    };
    wistorm_api._updatePost('_iotDevice', query_json, update_json, auth_code, true, function(json){
        if(json.status_code == 0){
            query_json = {
                'geofences.id': _id
            };
            wistorm_api._count('_iotDevice', query_json, auth_code, true, function(dev){
                var count = dev.count||0;
                query_json = {
                    objectId: _id
                };
                update_json = {
                    vehicleCount: count
                };
                wistorm_api._update('overlay', query_json, update_json, auth_code, true, function(json){
                    $("#divGeofenceAssign").dialog("close");
                    // _queryGeofence();
                    $("a#" + _id + ".vehicleCount").html(count);
                    $("#binded").prop("checked", true);
                    setAssignButton();
                    _query();
                });
            });
        }else{
            _alert(i18next.t("geofence.msg_bind_fail"), 3);
        }
    });
};

// 解绑围栏
var _unassign = function(did, actionType){
    if(_id === 0){
        _alert(i18next.t("geofence.msg_select_geofence"));
        return;
    }
    var query_json = {
        did: did
    };
    var add_json = {
        id: _id,
        type: actionType
    };
    var updatedAt = new Date().format('yyyy-MM-dd hh:mm:ss');
    var update_json = {
        'geofences': '-' + JSON.stringify(add_json),
        'geoUpdatedAt': updatedAt
    };
    wistorm_api._updatePost('_iotDevice', query_json, update_json, auth_code, true, function(json){
        if(json.status_code == 0){
            query_json = {
                'geofences.id': _id
            };
            wistorm_api._count('_iotDevice', query_json, auth_code, true, function(dev){
                var count = dev.count||0;
                query_json = {
                    objectId: _id
                };
                update_json = {
                    vehicleCount: count
                };
                wistorm_api._update('overlay', query_json, update_json, auth_code, true, function(json){
                    $("#divGeofenceAssign").dialog("close");
                    // _queryGeofence();
                    $("a#" + _id + ".vehicleCount").html(count);
                    $("#binded").prop("checked", true);
                    _query();
                });
            });
        }else{
            _alert(i18next.t("geofence.msg_unbind_fail"), 3);
        }
    });
};

var clearVehicles = function () {
    _table.fnClearTable();
};

var clearGeofences= function () {
    _tableGeofence.fnClearTable();
};

var getSelectDevices = function(){
    var list = $("#vehicleList [type='checkbox']:checked");
    var devices = [];
    for(var i = 0; i < list.length; i++){
        if(list[i].name && list[i].name !== ''){
            devices.push(list[i].name);
        }
    }
    return devices.join('\r\n');
};

var getAssignDevices = function(){
    var list = $("#vehicleList [type='checkbox']:checked");
    var devices = [];
    for(var i = 0; i < list.length; i++){
        if(list[i].name && list[i].name !== ''){
            devices.push(list[i].id);
        }
    }
    return {
        'did': devices.join('|')
    };
};

var statusSelected;
var collapsed = true;
var wimap;
var _type = 0;  //0:没有选择 2:多边形 4：圆形 5：行政区划
var _drawed = false;
var _overlay;
var drawingManager;
var deviceShow = false;

function windowResize() {
    //高度变化改变(要重新计算_browserheight)
    var windowHeight = $(window).height() - 80;
    $('#map_canvas').css({"height": windowHeight + "px"});
    // 修改车辆列表高度
    var height = $(window).height() - 220;
    $('.dataTables_scrollBody').css({"height": height + "px"});
}

function setButtonMode(mode){
    switch (mode){
        case 0: //缺省
            $("#addGeofence").attr('disabled', false);
            $("#editGeofence").attr('disabled', false);
            $("#delGeofence").attr('disabled', false);
            break;
        case 1: //新增
            $("#addGeofence").attr('disabled', true);
            $("#editGeofence").attr('disabled', true);
            $("#delGeofence").attr('disabled', true);
            if(map_type === MAP_TYPE_BAIDU) {
                wimap.map.clearOverlays();
            }else{
                if(_overlay){
                    _overlay.setMap(null);
                }
            }
            _drawed = false;
            break;
        case 2: //修改
            $("#addGeofence").attr('disabled', true);
            $("#editGeofence").attr('disabled', true);
            $("#delGeofence").attr('disabled', true);
            _drawed = true;
            break;
    }
}

$(document).ready(function () {
    $("#alert").hide();

    map_type = $.cookie('lang') === 'zh' || $.cookie('lang') === 'zh-CN' ? MAP_TYPE_BAIDU : MAP_TYPE_GOOGLE;
    map_engine = $.cookie('lang') === 'zh' || $.cookie('lang') === 'zh-CN' ? 'BAIDU' : 'GOOGLE';

    var geoId = setInterval(function(){
        if(!i18nextLoaded){
            return;
        }

        $('#geofenceType a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        windowResize();

        typeDesc = ['', i18next.t("geofence.poi"), i18next.t("geofence.polygon"), i18next.t("geofence.polyline"), i18next.t("geofence.circle")];
        actionDesc = [i18next.t("geofence.in_out"), i18next.t("geofence.in"), i18next.t("geofence.out")];
        // customerQuery();
        _queryGeofence();
        _query();

        $("#addGeofence").click(function () {
            initFrmGeofence(i18next.t("geofence.add_geofence"), 1, "", "");
            _validator.resetForm();
            $("#divGeofence").dialog("open");
            // 打开绘图工具
            drawingManager.show();
            setButtonMode(1);
        });

        $("#editGeofence").click(function () {
            var createdAt = new Date(_createdAt).format('yyyy-MM-dd hh:mm:ss');
            initFrmGeofence(i18next.t("geofence.edit_geofence"), 2, _name, '', _remark, createdAt);
            if(_overlay){
                wimap.setEditable(_overlay);
            }
            if(_type === 4){
                $('#type').val(i18next.t("geofence.circle"));
                $('#typeInfo').html(i18next.t("geofence.radius", {radius: _overlay.getRadius().toFixed(0)}));
            }else if(_type === 2){
                $('#type').val(i18next.t("geofence.polygon"));
                $('#typeInfo').html('');
            }
            $("#divGeofence").dialog("open");
            drawingManager.show();
            setButtonMode(2);
        });

        $("#accordion-icon").click(function () {
            deviceShow = !deviceShow;
            if(deviceShow){
                $("#vehiclePanel").show();
            }else{
                $("#vehiclePanel").hide();
            }
            if (_table) {
                _table.fnSort([[1, "asc"]]);
            }
        });

        $("#deviceListClose").click(function () {
            deviceShow = false;
            $("#vehiclePanel").hide();
        });

        $("#delGeofence").click(function () {
            var selected = $("#geofenceList [type='checkbox']:checked:not([id='checkAll'])");
            if(selected.length === 0){
                _alert(i18next.t("geofence.msg_select_geofence"), 3);
                return;
            }
            var ids = [];
            for(var i = 0; i < selected.length; i++){
                ids.push(selected[i].id);
            }
            var _ids = ids.join('|');
            if(selected.length === 1){
                if (CloseConfirm(i18next.t("geofence.confirm_delete", {name: selected[0].name}))) {
                    _delete(_ids);
                }
            }else{
                if (CloseConfirm(i18next.t("geofence.confirm_delete2", {count: selected.length}))) {
                    _delete(_ids);
                }
            }
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmGeofence').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            $(this).dialog("close");
            if(map_type === MAP_TYPE_BAIDU) {
                drawingManager.close();
                drawingManager.hide();
                wimap.map.clearOverlays();
            }else{
                drawingManager.setOptions({
                    drawingMode: null
                });
                drawingManager.hide();
                if(_overlay){
                    _overlay.setMap(null);
                }
            }
            setButtonMode(0);
        };
        $('#divGeofence').dialog({
            position: { my: "right-20 bottom-50", at: "right bottom", of: $('#map_canvas') },
            autoOpen: false,
            width: 380,
            buttons: buttons,
            close: function( event, ui ) {
                if(map_type === MAP_TYPE_BAIDU) {
                    drawingManager.close();
                    drawingManager.hide();
                    wimap.map.clearOverlays();
                }else{
                    drawingManager.setOptions({
                        drawingMode: null
                    });
                    drawingManager.hide();
                    if(_overlay){
                        _overlay.setMap(null);
                    }
                }
                setButtonMode(0);
            }
        });

        $('#frmGeofence').submit(function () {
            if ($('#frmGeofence').valid()) {
                if(!_drawed){
                    _alert(i18next.t("geofence.msg_draw_geofence"), 3);
                    return false;
                }
                if (_flag === 1) {
                    _add();
                } else {
                    _edit();
                }
                setButtonMode(0);
            }
            return false;
        });

        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmGeofenceAssign').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            $(this).dialog("close");
        };
        $('#divGeofenceAssign').dialog({
            autoOpen: false,
            width: 380,
            buttons: buttons
        });

        $('#frmGeofenceAssign').submit(function () {
            _assign();
            return false;
        });

        $("#assignDevices").click(function () {
            if(_id === 0){
                _alert(i18next.t("geofence.msg_select_bind"), 3);
                return;
            }
            if (getSelectDevices() === '') {
                _alert(i18next.t("geofence.msg_select_vehicle"), 3);
                return;
            }
            initFrmGeofenceAssign(i18next.t("geofence.assign_vehicle"), _name, getSelectDevices());
            $("#divGeofenceAssign").dialog("open");
        });

        $("#binded").click(function () {
            setAssignButton();
            _query();
        });

        $("#checkAll").click(function () {
            $("#geofenceList [type='checkbox']").prop("checked", $('#checkAll').prop("checked"));//全选
        });

        $("#checkAll2").click(function () {
            $("#vehicleList [type='checkbox']").prop("checked", $('#checkAll2').prop("checked"));//全选
        });

        $("#deviceList").click(function () {
            if (_table) {
                _table.fnSort([[1, "asc"]]);
            }
        });

        $(document).on("click", "#vehicle-status li", function () {
            statusSelected.removeClass("active");
            $(this).addClass("active");
            statusSelected = $(this);
            var flag = $(this).attr('flag') === '' ? '': '[' + $(this).attr('flag') + ']';
            var regex = flag === '[1]' ? '[13]': flag;
            // console.log(regex);
            vehicle_table.api().search(regex, true).draw();
        });

        $(document).on("click", "#vehicleList .icon-remove", function () {
            var did = $(this).attr("did");
            var actionType = parseInt($(this).attr("actionType"));
            if (CloseConfirm(i18next.t("geofence.confirm_delete_bind", {name: _name}))) {
                _unassign(did, actionType);
            }
        });

        $(document).on("click", "#geofenceList .vehicleCount", function () {
            $("#vehiclePanel").show();
            if (_table) {
                _table.fnSort([[1, "asc"]]);
            }
        });

        //浏览器高度变化菜单栏对应改变
        // //刷新设置css
        windowResize();
        //高度变化改变(要重新计算_browserheight)
        $(window).resize(function () {
            // canvasHeight = $(window).height() - 80;
            // map_canvas.css({"height": canvasHeight + "px"});
            windowResize();
        });

        var center_point = { lon:lon, lat:lat };
        wimap = new wiseMap(map_type, document.getElementById('map_canvas'), center_point, 15);

        if(map_type === MAP_TYPE_BAIDU){
            // 多边形和矩形绘制
            var circlecomplete = function (e, overlay) {
                // lon = overlay.getPosition().lng;
                // lat = overlay.getPosition().lat;
                _overlay = overlay;
                _type = 4;
                // alert(overlay.getRadius());
                $('#type').val(i18next.t("geofence.circle"));
                $('#typeInfo').html(i18next.t("geofence.radius", {radius: overlay.getRadius().toFixed(0)}));
                overlay.enableEditing();
                overlay.addEventListener('lineupdate', function(type, target){
                    // console.log(type.target.getRadius());
                    $('#typeInfo').html(i18next.t("geofence.radius", {radius: type.target.getRadius().toFixed(0)}));
                    _drawed = true;
                });
                drawingManager.close();
                _drawed = true;
            };
            var polygoncomplete = function (e, overlay) {
                // lon = overlay.getPosition().lng;
                // lat = overlay.getPosition().lat;
                // alert(overlay.getRadius());
                _overlay = overlay;
                _type = 2;
                $('#type').val(i18next.t("geofence.polygon"));
                overlay.enableEditing();
                drawingManager.close();
                _drawed = true;
            };
            var styleOptions = {
                strokeColor: "red",    //边线颜色。
                fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 3,       //边线的宽度，以像素为单位。
                strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
                fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
                strokeStyle: 'solid' //边线的样式，solid或dashed。
            };
            //实例化鼠标绘制工具
            drawingManager = new BMapLib.DrawingManager(wimap.map, {
                isOpen: false, //是否开启绘制模式
                enableDrawingTool: true, //是否显示工具栏
                enableCalculate: false,
                drawingToolOptions: {
                    anchor: BMAP_ANCHOR_TOP_LEFT, //位置
                    offset: new BMap.Size(75, 10), //偏离值
                    drawingModes : [
                        BMAP_DRAWING_CIRCLE,
                        BMAP_DRAWING_POLYGON
                    ]
                },
                circleOptions: styleOptions, //圆的样式
                polylineOptions: styleOptions, //线的样式
                polygonOptions: styleOptions, //多边形的样式
                rectangleOptions: styleOptions //矩形的样式
            });
            //添加鼠标绘制工具监听事件，用于获取绘制结果
            drawingManager.addEventListener('polygoncomplete', polygoncomplete);
            drawingManager.addEventListener('circlecomplete', circlecomplete);
            drawingManager.show = function(){
                $('.BMapLib_Drawing_panel').show();
            };
            drawingManager.hide = function(){
                $('.BMapLib_Drawing_panel').hide();
            };
        }else{
            // 多边形和矩形绘制
            var circlecomplete = function (overlay) {
                // lon = overlay.getPosition().lng;
                // lat = overlay.getPosition().lat;
                _overlay = overlay;
                _type = 4;
                // alert(overlay.getRadius());
                $('#type').val(i18next.t("geofence.circle"));
                $('#typeInfo').html(i18next.t("geofence.radius", {radius: overlay.getRadius().toFixed(0)}));
                // overlay.enableEditing();
                // overlay.addEventListener('lineupdate', function(type, target){
                //     // console.log(type.target.getRadius());
                //     $('#typeInfo').html(i18next.t("geofence.radius", {radius: type.target.getRadius().toFixed(0)}));
                // });
                // drawingManager.close();
                google.maps.event.addListener(overlay, 'radius_changed', function() {
                    $('#typeInfo').html(i18next.t("geofence.radius", {radius: _overlay.getRadius().toFixed(0)}));
                    _drawed = true;
                });
                drawingManager.setOptions({
                    drawingMode: null
                });
                _drawed = true;
            };
            var polygoncomplete = function (overlay) {
                // lon = overlay.getPosition().lng;
                // lat = overlay.getPosition().lat;
                // alert(overlay.getRadius());
                _overlay = overlay;
                _type = 2;
                $('#type').val(i18next.t("geofence.polygon"));
                // overlay.enableEditing();
                drawingManager.setOptions({
                    drawingMode: null
                });
                _drawed = true;
            };
            var styleOptions = {
                fillColor: 'red',
                fillOpacity: 0.6,
                strokeWeight: 3,
                clickable: false,
                editable: true,
                zIndex: 1
            };
            drawingManager = new google.maps.drawing.DrawingManager({
                // drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT,
                    drawingModes: ['circle', 'polygon']
                },
                circleOptions: styleOptions, //圆的样式
                polygonOptions: styleOptions //线的样式
            });
            drawingManager.setMap(wimap.map);
            google.maps.event.addListener(drawingManager, 'polygoncomplete', polygoncomplete);
            google.maps.event.addListener(drawingManager, 'circlecomplete', circlecomplete);
            drawingManager.show = function(){
                drawingManager.setOptions({
                    drawingControl: true
                });
            };
            drawingManager.hide = function(){
                drawingManager.setOptions({
                    drawingControl: false
                });
            };
        }

        $('#searchVehicle').keydown(function(e){
            var curKey = e.which;
            if(curKey === 13){
                var key = '';
                if($('#searchVehicle').val() !== ''){
                    key = $('#searchVehicle').val();
                }
                clearVehicles();
                _query(key);
                return false;
            }
        });

        $('#searchGeofence').keydown(function(e){
            var curKey = e.which;
            if(curKey === 13){
                var key = '';
                if($('#searchGeofence').val() !== ''){
                    key = $('#searchGeofence').val();
                }
                clearGeofences();
                _queryGeofence(key);
                return false;
            }
        });

        _validator = $('#frmGeofence').validate(
            {
                rules: {
                    name: {
                        required: true
                    }
                },
                messages: {
                    name: {required: i18next.t("geofence.name_required")}
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

        clearInterval(geoId);
    }, 100);
});


