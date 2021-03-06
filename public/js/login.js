/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-8-30
 * Time: 上午10:59
 * To change this template use File | Settings | File Templates.
 */
var txtName, txtPwd;
function checkBrowser() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.appVersion.indexOf("MSIE 6.0") > 0 || navigator.appVersion.indexOf("MSIE 7.0") > 0 || navigator.appVersion.indexOf("MSIE 8.0") > 0) {
            $("#browser").show();
        } else {
            $("#browser").hide();
        }
    };
}

$(function () {
    // 判断浏览器版本

    checkBrowser();

    W.$ajax('mysql_api/list', {
        json_p: { apply2_id: '>0', sp_status: 1, isagree: 0 },
        table: 'ga_spstatus',
    }, function (res) {
        // console.log(res)
        var i = 0;
        res.data.forEach(ele => {
            W.$ajax('mysql_api/list', {
                json_p: { XLH: ele.apply2_id },
                sorts: 'XLH',
                table: 'ga_apply2',
            }, function (res1) {
                ele.apply2 = res1.data[0];
                if (res1.data[0]) {
                    W.$ajax('mysql_api/list', {
                        json_p: { id: res1.data[0].DEPT },
                        table: 'ga_depart',
                    }, function (res2) {
                        res1.data[0].department = res2.data[0]
                        i++;
                        if (i == res.total) {
                            console.log(res)
                            showAllAudit(res.data)
                        }
                    })
                } else {
                    i++;
                    if (i == res.total) {
                        console.log(res)
                        showAllAudit(res.data)
                    }
                }

            })
        })
    })
    function showAllAudit(data) {
        var obj = {};
        data.forEach((ele, index) => {
            obj[ele.apply2.department.name] = { status1: 0, status2: 0, status3: 0, status4: 0 }
        })
        data.forEach((ele, index) => {
            ele.status == 1 ? obj[ele.apply2.department.name].status1++ : null;
            ele.status == 2 ? obj[ele.apply2.department.name].status2++ : null;
            ele.status == 3 ? obj[ele.apply2.department.name].status3++ : null;
            ele.status == 4 ? obj[ele.apply2.department.name].status4++ : null;
        })
        // $('#allmessage').empty()
        for (var o in obj) {
            var tr_content = `<tr><td>` + o + `</td>
            <td `+ (obj[o].status4 ? 'style="color:red"' : null) + `>` + obj[o].status4 + `</td>
            <td `+ (obj[o].status1 ? 'style="color:red"' : null) + `>` + obj[o].status1 + `</td>
            <td `+ (obj[o].status2 ? 'style="color:red"' : null) + `>` + obj[o].status2 + `</td>
            <td `+ (obj[o].status3 ? 'style="color:red"' : null) + `>` + obj[o].status3 + `</td></tr>`
            $('#allmessage').append(tr_content)
        }
        console.log(obj)
        if (data.length) $('#table_show').show()
    }
    //记住密码
    if ($.cookie("checked") != "") {
        $("#remeber").attr("checked", true);
        txtName = $.cookie("username");
        txtPwd = $.cookie("password");
        if (txtName != "" && txtName != null)
            $("#username").val(txtName);
        else
            $("#username").val("");
        if (txtPwd != "" && txtPwd != null)
            $("#password").val(txtPwd);
        else
            $("#password").val("");

    }

    //获取localhost地址
    $.get('/config', function (data, textStatus) {
        if (textStatus != "success") {
            $.cookie('Host', null);
            return;
        }
        $.cookie('Host', data);
    });

    $('#lng').change(function () {
        location.href = '?lang=' + $('#lng').val();
    });

    //首次加载不显示ValidateCode 当ajax请求失败加载(利用ValidateCode所在样式是否存在来判断)
    var _btnClick;
    $("#btnLogin").click(function () {
        _btnClick = $(this);
        $(this).button('loading');
        // return;
        if ($("#username").val() == "") {
            $(this).button('reset');
            _alert(i18next.t("login.input_username"));
            return;
        } else if ($("#password").val() == "") {
            $(this).button('reset');
            _alert(i18next.t("login.input_password"));
            return;
        } else {
            txtName = $("#username").val();
            txtPwd = hex_md5($("#password").val());
        }

        if ($("#remeber").is(":checked")) {
            $.cookie("remeber", true, { expires: 7 });
            $.cookie("username", $("#username").val(), { expires: 7 });
            $.cookie("password", $("#password").val(), { expires: 7 });
        }
        else {
            $.cookie("remeber", false, { expires: 7 });
            $.cookie("username", "");
            $.cookie("password", "");
        }

        var logUrl = "/login";
        var logData = { username: txtName, password: txtPwd };
        var obj = { type: "GET", url: logUrl, data: logData, success: success, error: error };
        ajax_function(obj);
        // wistorm_api.login(txtName, txtPwd, success);
    });

    //登录成功后保存密码和用户名
    var success = function (json) {
        _btnClick.button('reset');
        if (json === null) {
            _alert(i18next.t("login.err_msg"));
            clearLogin();
        }
        else if (json.status_code == 0) {
            // $.post('/login/save', { user_name: txtName }, function (data, textStatus) {
            //     if (textStatus == "success") {
            //$.cookie('xmlHost', "http://" + json.host + ":" + json.port + "/app/");
            //$.cookie('xmlHost', "http://" + json.host + "/app/");
            $.cookie('username', $("#username").val());
            $.cookie('auth_code', json.access_token);
            $.cookie('app_key', json.app_key);
            $.cookie('app_secret', json.app_secret);
            $.cookie('dev_key', json.dev_key);
            $.cookie('sec_pass', json.sec_pass);
            $.cookie('tree_path', json.tree_path);
            // $.cookie('dealer_name', json.dealer_name);
            $.cookie('dealer_id', json.uid);
            $.cookie('parent_id', json.pid || '');
            $.cookie('dealer_type', json.user_type);
            $.cookie('name', json.name);
            $.cookie('tree_path', json.tree_path);
            $.cookie('parent_name', json.parent_name);
            $.cookie('parent_contact', json.parent_contact);
            $.cookie('parent_tel', json.parent_tel);
            $.cookie('cust_id', json.cust_id);
            $.cookie('cust_name', json.cust_name);
            $.cookie('lang', $('#_lang').val());
            $.cookie('login_depart_id', json.depart_id);
            if (json.default_page) {
                location.href = json.default_page;
            } else {
                location.href = '/customer';
            }
            //     }
            //     else {
            //         msgShow("您输入的帐号或密码不正确，请重新输入。");
            //         clearLogin();
            //     }
            // });
        } else if (json.status_code == 1) {
            _alert(i18next.t("login.wrong_username"));
            clearLogin();
        } else if (json.status_code == 2) {
            _alert(i18next.t("login.wrong_password"));
            clearLogin();
        } else if (json.status_code == 3) {
            _alert(i18next.t("login.no_right"));
            clearLogin();
        } else {
            _alert(i18next.t("msg.err-execption") + "[code=" + json.status_code + "]");
            clearLogin();
        }
    };

    var error = function OnError(XMLHttpRequest, textStatus, errorThrown) {
        _btnClick.button('reset');
        if (errorThrown || textStatus == "error" || textStatus == "parsererror" || textStatus == "notmodified") {
            _alert("服务器连接异常，请检查网络。");
            clearLogin();
            return;
        }
        if (textStatus == "timeout") {
            _alert("网络连接超时，请检查网络");
            clearLogin();
        }
    };

    setTimeout(function () {
        // 设置当前选择语言
        i18next.changeLanguage($('#_lang').val() || $.cookie("lang") || 'en');
        $('#lng').val($('#_lang').val() || $.cookie("lang") || 'en');
        $.cookie('lang', $('#_lang').val() || $.cookie("lang") || 'en');
    }, 100);
});