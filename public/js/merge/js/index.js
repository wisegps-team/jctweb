// import { create } from "domain";

// window._user;
$(document).ready(function () {
    var _tab = 0;
    var _tab1 = 0;
    var _tab2 = 0;
    _tab = sessionStorage.getItem('tab') || 0;
    _tab1 = sessionStorage.getItem('tab1') || 0;
    _tab2 = sessionStorage.getItem('tab2') || 0;

    var currentPage = 0,
        pageSize = 10;


    var app_state = {
        0: '撤销',
        1: '审批中',
        4: '审批驳回',
        5: '待报销',
        6: '已结束'
    }

    var w_audited = [],
        w_auditing = [],
        w_commit = [],
        show_more = true;

    var all_audits = [];
    var all_apply = [];

    var _user = null;
    function getJson(url, callback, option, type) {
        var types = type ? type : 'get';
        var option = Object.assign({}, option ? option : {})
        $.ajax({
            url: url,
            dataType: 'json',
            data: option,
            timeout: 100000,
            type: types,
            success: callback,
            error: function (err) { },
        })
    }
    var userid = W.getCookie('userid');
    getJson('/get_user', MY_User, { userid: userid })
    function MY_User(res) {
        console.log(res, 'dfdfdf')

        localStorage.setItem('user', JSON.stringify(res));
        // window._user = res;
        _user = res;
        getJson('/search_audit_list', search, { uid: _user.user.id })

        // getJson('/search_apply', search2, { uid: _user.user.id, depart: _user.depart.id })

        if (_tab == 2) {
            getMyList()
        } else if (_tab == 1) {
            if (_tab1 == 0) {
                get_no_auditList()
            } else if (_tab1 == 1) {
                getauditlist()
            }
        } else if (_tab == 3) {
            if (_tab2 == 1) {
                getdriver()
            } else if (_tab2 == 0) {
                back_car()
            }

        }
        if (_user.user.role == '管理员') {
            $('#show_back').show()
        }
    }

    // getJson('/get_left', get_car)
    // function get_car(res){
    //     console.log(res)
    // }
    // localStorage.setItem()


    weui.tab('#tab', {
        defaultIndex: _tab,
        onChange: function (index) {
            sessionStorage.setItem('tab', index);
            console.log(index, 1);
            _tab = index;
            currentPage = 0;
            if (index == 2) {
                getMyList()
            } else if (index == 1) {
                if (_tab1 == 0) {
                    get_no_auditList()
                } else if (_tab1 == 1) {
                    getauditlist()
                }

            } else if (index == 3) {

                if (_tab2 == 1) {
                    getdriver()
                } else {
                    back_car()
                }
            }
        }
    });
    //提交列表
    function getMyList() {
        getJson('/get_applys', own_List, { uid: _user.user.id, depart: _user.depart.id })
    }


    //列出提交列表
    function own_List(res) {
        console.log(res)
        all_apply = res;
        $('#own_list').empty();
        res = res || [];
        if (res.length) {
            res.forEach((ele, index) => {
                if (ele.id) {
                    var _href = './my_list?applyid=' + ele.id + '&my=' + true;
                    var _status = 0;
                    var name = ele.name
                    console.log(index)
                    if (ele.spstatus.length == 1) {
                        if (ele.spstatus[0].isagree == 1) {
                            _status = 1;
                            if (ele.etm) {
                                _status = 2;
                            }
                        } else {
                            _status = 0;
                        }
                        if (ele.spstatus[0].isagree == 2) {
                            _status = 3;
                        }
                        if (!ele.spstatus[0].isagree && ele.etm > 0) {
                            _status = 4;
                        }
                    } else if (ele.spstatus.length == 3) {

                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                            _status = 1;
                            if (ele.etm) {
                                _status = 2;
                            }
                        } else {
                            _status = 0;
                        }

                        if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                            _status = 3;
                        }
                        if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                            _status = 4;
                        }
                    }
                    var use_status = '';
                    var color_status = '';
                    _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                    _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                    var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                    var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                    <span style="vertical-align: middle">${name}用车</span>
                                    <span class="weui-badge great ${color_status}  chang_f12" style="margin-left: 5px;">${use_status}</span>
                                </h4>
                                <div class="weui-flex__item t_a_r">${date}</div>
                            </div>
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">事由</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.days}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`
                    $('#own_list').append(str_content);
                }
                if (ele.XLH) {
                    var _href = './fix_detail?applyid=' + ele.XLH + '&my=true';
                    name = ele.SQR + '的车修'
                    var use_status = app_state[ele.STATE];
                    var color_status = '';
                    ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                    // if (level_show) {
                    var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                            <div class="f14 w_100">
                                <div class="weui-media-box weui-media-box_text">
                                    <div class="weui-flex">
                                        <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                            <span style="vertical-align: middle">${name}</span>
                                            <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                        </h4>
                                        <div class="weui-flex__item t_a_r" style="flex:2">${W.dateToString(W.date(ele.SQSJ))}</div>
                                    </div>
                                    <div class="weui-flex ">
                                        <div class="weui-flex__item">
                                            <div class="weui-cell p_0">
                                                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                    <p class="c_9">号码号牌</p>
                                                </div>
                                                <div class="weui-cell__bd">
                                                    <p>${ele.HPHM}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">预计金额</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.YJJED}</p>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </a>`
                    $('#own_list').append(str_content);
                    // type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                    // }
                }


            })
        }

    }

    //获已审核列表
    function getauditlist() {
        getJson('/audit_list', audit_list, { uid: _user.user.id, pageSize: pageSize, currentPage: currentPage })
    }
    //未审核
    function get_no_auditList() {
        getJson('/no_audit_list', audit_list, { uid: _user.user.id, pageSize: pageSize, currentPage: currentPage })
    }
    //筛选审核列表
    function audit_list(res) {
        // console.log(res)
        if (res.length < pageSize) {
            show_more = false;
        } else {
            show_more = true;
        }
        var audited = [];
        var auditing = [];
        res.forEach((ele, index) => {
            if (ele.isagree) {
                audited.push(ele)
            } else {
                // if(ele.STATE == 1){
                    auditing.push(ele)
                // }else {
                    // audited.push(ele) 
                // }
                
            }
        })
        if (_tab1 == 1) {
            w_audited = w_audited.concat(audited);
            showAudit(w_audited, 1)
        } else {
            w_audited = w_auditing.concat(auditing);
            showAudit(w_audited, 2)
        }

    }


    function showAudit(data, type) {
        console.log(data, type)
        _show_audit_list(data, type)
        // own_List(data)
    }

    function _show_audit_list(res, type) {
        console.log(res)
        type == 1 ? $('#_audited').empty() : $('#_auditing').empty();
        var name = '';
        var level_show = false;
        res.forEach((ele, index) => {
            if (ele.id) {
                var _href = './my_list?applyid=' + ele.id;
                name = ele.name + '的用车'
                var _status = 0;
                // console.log(index)
                if (ele.spstatus.length == 1) {
                    if (ele.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (ele.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!ele.spstatus[0].isagree && ele.etm > 0) {
                        _status = 4;
                    }
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    }
                } else if (ele.spstatus.length == 3) {
                    // if (ele.spstatus[0].isagree || ele.spstatus[1].isagree || ele.spstatus[2].isagree && ele.etm > 0) {
                    //     _status = 4;
                    // }
                    if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }

                    if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                        _status = 4;
                    }
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    } else if (_user.user.role == '警务保障室领导') {
                        if (ele.spstatus[0].isagree == 1) {
                            level_show = true
                        }
                    } else if (_user.user.role == '局领导') {
                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                            level_show = true
                        }
                    }
                }
                var use_status = '';
                var color_status = '';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                if (_user.user.role == '管理员') {
                    level_show = true;
                }
                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                if (level_show) {
                    var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                    <span style="vertical-align: middle">${name}</span>
                                    <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                </h4>
                                <div class="weui-flex__item t_a_r">${date}</div>
                            </div>
        
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">事由</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.days}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">车牌号码</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.car_num}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </a>`
                    // $('#own_list').append(str_content);
                    type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                }
            }
            if (ele.XLH) {
                var _href = './fix_detail?applyid=' + ele.XLH;
                name = ele.SQR + '的车修'
                // var _status = 0;
                // console.log(index)
                if (ele.spstatus.length == 1) {
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    }
                } else if (ele.spstatus.length == 2) {
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    } else if (_user.user.role == '警务保障室领导') {
                        if (ele.spstatus[0].isagree == 1) {
                            level_show = true
                        }
                    }
                } else if (ele.spstatus.length == 3) {
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    } else if (_user.user.role == '警务保障室领导') {
                        if (ele.spstatus[0].isagree == 1) {
                            level_show = true
                        }
                    } else if (_user.user.role == '局领导') {
                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                            level_show = true
                        }
                    }
                } else if (ele.spstatus.length == 4) {
                    if (_user.user.role == '科所队领导') {
                        level_show = true;
                    } else if (_user.user.role == '警务保障室领导') {
                        if (ele.spstatus[0].isagree == 1) {
                            level_show = true
                        }
                    } else if (_user.user.role == '专管员') {
                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                            level_show = true
                        }
                    }
                    else if (_user.user.role == '局领导') {
                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[3].isagree == 1) {
                            level_show = true
                        }
                    }
                }
                var use_status = app_state[ele.STATE];
                var color_status = '';
                // _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                // if (_user.user.role == '管理员') {
                //     level_show = true;
                // }
                // var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                if (level_show) {
                    var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                    <span style="vertical-align: middle">${name}</span>
                                    <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                </h4>
                                <div class="weui-flex__item t_a_r" style="flex:2">${W.dateToString(W.date(ele.SQSJ))}</div>
                            </div>
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">号码号牌</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.HPHM}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">预计金额</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.YJJED}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </a>`
                    // $('#own_list').append(str_content);
                    type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                }
            }

        })
        var more_content = `
                <a class="weui-cell weui-cell_access" href="javascript:;" id="changeCPage">
                <div class="f14 w_100">
                    <div class="t_a_c">
                        更多···
                    </div>
                </div>
            </a>
            `;

        if (show_more) {
            type == 1 ? $('#_audited').append(more_content) : $('#_auditing').append(more_content)
        }
        $("#changeCPage").on('click', function () {
            console.log(currentPage);
            currentPage++;
            if (_tab1 == 1) {
                getauditlist();
            }
        })
    }



    weui.searchBar('#my_list #searchBar');
    weui.searchBar('#audit_list #searchBar1');

    //tab切换
    function tab(selector) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var $eles = $(selector);
        console.log($eles);
        console.log((0, $)(selector))

        var $eles = $(selector);
        options = $.extend({
            defaultIndex: 0,
            onChange: $.noop
        }, options);
        console.log(options)
        $eles.forEach(function (ele) {
            var $tab = $(ele);
            console.log($tab)
            var $tabItems = $tab.find('.weui-navbar__item1, .weui-tabbar__item1');
            console.log($tabItems)
            var $tabContents = $tab.find('.weui-tab__content1');
            console.log($tabContents)

            $tabItems.eq(options.defaultIndex).addClass('weui-bar__item_on');
            $tabContents.eq(options.defaultIndex).show();

            $tabItems.on('click', function () {
                var $this = $(this),
                    index = $this.index();

                $tabItems.removeClass('weui-bar__item_on');
                $this.addClass('weui-bar__item_on');

                $tabContents.hide();
                $tabContents.eq(index).show();

                options.onChange.call(this, index);
            });
        });
    }

    //审核已处理和未处理
    tab('#tab1', {
        defaultIndex: _tab1,
        onChange: function (index) {
            console.log(index, 'index')
            sessionStorage.setItem('tab1', index);
            _tab1 = index;
            currentPage = 0;
            if (index == 0) {
                w_auditing = [];
                get_no_auditList();
            } else if (index == 1) {
                w_audited = [];
                getauditlist();
            }

        }
    });

    $('#use_car').on('click', function () {
        top.location = './apply'
    })



    //车队还车
    // if(_user.use)
    function back_car() {
        getJson('/getcar_num', showcarlist, { depart: 58 })
    }

    function getdriver() {
        getJson('/getdriver', showcarlist1)
    }

    function tab1(selector) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var $eles = $(selector);
        console.log($eles);
        console.log((0, $)(selector))

        var $eles = $(selector);
        options = $.extend({
            defaultIndex: 0,
            onChange: $.noop
        }, options);
        console.log(options)
        $eles.forEach(function (ele) {
            var $tab = $(ele);
            console.log($tab)
            var $tabItems = $tab.find('.weui-navbar__item2, .weui-tabbar__item2');
            console.log($tabItems)
            var $tabContents = $tab.find('.weui-tab__content2');
            console.log($tabContents)

            $tabItems.eq(options.defaultIndex).addClass('weui-bar__item_on');
            $tabContents.eq(options.defaultIndex).show();

            $tabItems.on('click', function () {
                var $this = $(this),
                    index = $this.index();

                $tabItems.removeClass('weui-bar__item_on');
                $this.addClass('weui-bar__item_on');

                $tabContents.hide();
                $tabContents.eq(index).show();

                options.onChange.call(this, index);
            });
        });
    }
    tab1('#tab2', {
        defaultIndex: _tab2,
        onChange: function (index) {
            console.log(index)
            _tab2 = index;
            sessionStorage.setItem('tab2', index);
            if (index == 1) {
                getdriver()
            } else {
                back_car()
            }
        }
    });

    function showcarlist(res) {
        console.log(res);
        $('#ss11').empty();
        res.forEach((ele, index) => {
            if (ele.id) {
                var _href = './my_list?applyid=' + ele.id;
                var _status = 0;
                console.log(index)
                if (ele.spstatus.length == 1) {
                    if (ele.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (ele.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!ele.spstatus[0].isagree && ele.etm > 0) {
                        _status = 4;
                    }
                } else if (ele.spstatus.length == 3) {

                    if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }

                    if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                        _status = 4;
                    }
                }
                var use_status = '';
                var color_status = '';
                _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000));
                var name = ele.name
                var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                <div class="f14 w_100">
                    <div class="weui-media-box weui-media-box_text">
                        <div class="weui-flex">
                            <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                <span style="vertical-align: middle">${name}的用车</span>
                                <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                            </h4>
                            <div class="weui-flex__item t_a_r">${date}</div>
                        </div>
        
                        <div class="weui-flex ">
                            <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">事由</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>`
                $('#ss11').append(str_content);
            }

        })


    }

    function showcarlist1(res) {
        console.log(res);
        $('#ss22').empty();
        res.forEach((ele, index) => {
            if (ele.id) {
                var _href = './my_list?applyid=' + ele.id;
                var _status = 0;
                console.log(index)
                if (ele.spstatus.length == 1) {
                    if (ele.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (ele.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!ele.spstatus[0].isagree && ele.etm > 0) {
                        _status = 4;
                    }
                } else if (ele.spstatus.length == 3) {

                    if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }

                    if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                        _status = 4;
                    }
                }
                var use_status = '';
                var color_status = '';
                _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000));
                var name = ele.name
                var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                <div class="f14 w_100">
                    <div class="weui-media-box weui-media-box_text">
                        <div class="weui-flex">
                            <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                <span style="vertical-align: middle">${name}的用车</span>
                                <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                            </h4>
                            <div class="weui-flex__item t_a_r">${date}</div>
                        </div>
        
                        <div class="weui-flex ">
                            <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">事由</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>`
                $('#ss22').append(str_content);
            }

        })


    }



    $('#search_list2').on('input', function () {
        // console.log('hello')
        // console.log(this.value)
        // getJson('/search_apply', own_List, { uid: _user.user.id, search: this.value, depart: _user.depart.id })
        console.log(this.value)
        var ss = [];
        var res = this.value
        if (res) {
            all_apply.forEach(s2 => {
                if (s2.name) {
                    if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                        ss.push(s2)
                    }
                } else {
                    if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                        ss.push(s2)
                    }
                }
            })
        } else {
            ss = all_apply
        }

        own_List(ss)
    })


    $('#search_list1').on('input', function () {
        audit_filter(this.value)
    })
    function audit_filter(res) {
        var ss = [];
        show_more = false;
        if (!res) {
            show_more = true;
            w_audited = [];
            w_auditing = []
        }
        if (_tab1 == 0) {
            if (res) {
                // ss = all_audits.filter(s1 => s1.isagree == 0 && (s1.name.includes(res) || s1.days.includes(res) || s1.SQR.includes(res) || s1.HPHM.includes(res) || s1.car_num.includes(res)))
                all_audits.forEach(s2 => {
                    if (s2.isagree == 0) {
                        if (s2.name) {
                            if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                                ss.push(s2)
                            }
                        } else {
                            if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                                ss.push(s2)
                            }
                        }
                    }
                })
                showAudit(ss, 2)
            } else {
                get_no_auditList();
            }

        } else if (_tab1 == 1) {
            if (res) {
                all_audits.forEach(s2 => {
                    if (s2.isagree > 0) {
                        if (s2.name) {
                            if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                                ss.push(s2)
                            }
                        } else {
                            if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                                ss.push(s2)
                            }
                        }
                    }
                })
                // ss = all_audits.filter(s2 => s2.isagree > 0 && (s2.name.includes(res) || s2.days.includes(res) || s2.SQR.includes(res) || s2.HPHM.includes(res) || s2.car_num.includes(res)))
                showAudit(ss, 1)

            } else {
                // show_more = true
                getauditlist()
            }

        }

    }
    function search(res) {
        // console.log(res)
        res = res.filter(ele => ele.name || ele.SQR)
        console.log(res)
        all_audits = res;
    }

    function search2(res) {
        all_apply = res;
    }
})