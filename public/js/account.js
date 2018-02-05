/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-26
 * Time: 下午11:33
 * To change this template use File | Settings | File Templates.
 */

var auth_code = $.cookie('auth_code');

// 初始化账号信息窗体
var initFrmAccount = function(title){
    $("#divAccount").dialog("option", "title", title);
    $('#account_old_password').val("");
    $('#account_password').val("");
    $('#account_password2').val("");
};

// 修改密码
var AccountEdit = function(){
    var auth_code = $.cookie('auth_code');
    var username = $.cookie('username');    //用户名
    var old_password = $('#account_old_password').val();  //旧密码
    var new_password = $('#account_password').val();  //旧密码

    // var sendUrl = $.cookie('Host') + "dealer/user/password?auth_code=" + auth_code;
    // var sendData = {
    //     user_name: username,
    //     old_password: hex_md5(old_password),
    //     new_password: hex_md5(new_password),
    //     dealer_type: parseInt($.cookie("dealer_type"))
    // };
    // var sendObj = { type:"PUT", url:sendUrl, data:sendData, success:function (json) {
    //     AccountEditSuccess(json);
    // }, error:OnError };
    // ajax_function(sendObj);
    var query_json = {
        username: username,
        password: hex_md5(old_password)
    };

    var update_json = {
        password: hex_md5(new_password)
    };

    wistorm_api.update(query_json, update_json, auth_code, AccountEditSuccess);
};

var AccountEditSuccess = function(json) {
    if(json.status_code === 0){
        _ok(i18next.t("account.modify_success"));
        $("#divAccount").dialog("close");
    }else{
        _alert(i18next.t("account.modify_fail"));
    }
};

// 退出事件
var exit_success = function exit_success(json) {
    $.cookie("mapType", "");
    $.cookie("msgcount", "");
    $.cookie('Login', null);
    location.href = "/";
};

// 获取报警统计
var undealAlert = function(uid, callback){
    // 获取uid名下所有设备
    var query = {
        uid: uid.toString(),
        alertUndeal: true
    };
    wistorm_api._count('_iotDevice', query, auth_code, true, function (obj) {
        var count = obj.status_code === 0 ? obj.count : 0;
        callback(count);
    });
};

var alertBadge = document.getElementById('alertBadge');
var getAlertCount = function(){
    var dealerId = $.cookie('dealer_id');
    undealAlert(dealerId, function (count) {
        console.log('alert count: ' + count);
        alertBadge.innerHTML = count > 9 ? '..' : count;
        alertBadge.style.display = count > 0 ? 'block' : 'none';
    });
};

$(document).ready(function () {
    var timerAlertCount = function(){
        getAlertCount();
        setTimeout(function(){
            timerAlertCount();
        }, 60000);
    };
    // 获取报警计数
    timerAlertCount();

    //设置dealer_name
    $("#dealer_name").html($.cookie('username'));
    $("#btnExit").click(function () {
        var ExitMsg = i18next.t("system.exit");
        if (CloseConfirm(ExitMsg)) {
            var exitUrl = '/logout';
            var exitObj = {type: "GET", url: exitUrl, data: null, success: exit_success, error: OnError};
            ajax_function(exitObj);
        }
    });

    $("#dealer_name").click(function () {
        initFrmAccount(i18next.t("account.my_account"));
        $("#divAccount").dialog("open");
    });


    var accountId = setInterval(function(){
        if(!i18nextLoaded){
            return;
        }
        var buttons = {};
        buttons[i18next.t("system.save")] = function () {
            $('#frmAccount').submit();
        };
        buttons[i18next.t("system.cancel")] = function () {
            validator_account.resetForm();
            $(this).dialog("close");
        };
        // Dialog Simple
        $('#divAccount').dialog({
            autoOpen: false,
            width: 480,
            buttons: buttons
        });

        $('#frmAccount').submit(function () {
            if ($('#frmAccount').valid()) {
                AccountEdit();
            }
            return false;
        });

        validator_account = $('#frmAccount').validate(
            {
                rules: {
                    account_old_password: {
                        minlength: 6,
                        required: true
                    },
                    account_password: {
                        minlength: 6,
                        required: true
                    },
                    account_password2: {
                        minlength: 6,
                        required: true,
                        equalTo: "#account_password"
                    }
                },
                messages: {
                    account_old_password: {minlength: i18next.t("acount.old_password_minlength"), required: i18next.t("acount.old_password_required")},
                    account_password: {minlength: i18next.t("acount.new_password_minlength"), required: i18next.t("acount.new_password_required")},
                    account_password2: {required: i18next.t("acount.password2_required"), minlength: i18next.t("acount.password2_minlength"), equalTo: i18next.t("acount.password2_equalTo")}
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

        clearInterval(accountId);
    }, 100);
});