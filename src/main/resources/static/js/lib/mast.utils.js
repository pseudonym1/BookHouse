/**
 * 工具类
 * 依赖 mast全局对象
 */
!function () {
    mast.utils = {
        /**
         * 获取对象
         * 将json字符串转为对象
         * @param data
         */
        getObject: function (data) {
            data = data || {};
            if (typeof data == "string") {
                data = JSON.parse(data);
            }
            return data;
        },
        /**
         * 重新加载 grids
         *
         * @param grids
         */
        reload: function (grids) {
            if (!grids || (typeof grids !== "object")) return 0;
            if (grids instanceof Array) {
                $.each(grids, function (index, node) {
                    node.datagrid('reload').datagrid("unselectAll");
                })
            } else if (grids instanceof Object) {
                grids.datagrid('reload').datagrid("unselectAll");
            }
        },
        /**
         * 关闭对话框
         *
         * @param dialogs 可传入对象或对象数组
         */
        close: function (dialogs) {
            if (!dialogs || (typeof dialogs !== "object")) return 0;
            if (dialogs instanceof Array) {
                $.each(dialogs, function (index, node) {
                    node.dialog("close");
                })
            } else if (dialogs instanceof Object) {
                dialogs.dialog("close");
            }
        },
        /**
         * 清空表单
         *
         * @param vForms 可传入对象或对象数组
         */
        clear: function (vForms) {
            if (!vForms || (typeof vForms !== "object")) return 0;
            if (vForms instanceof Array) {
                $.each(vForms, function (index, node) {
                    node.form("clear");
                })
            } else if (vForms instanceof Object) {
                vForms.form("clear");
            }
        },
        /**
         * 将字符串，转为对象
         *
         * @param arr 数组
         * @returns {{}}
         */
        serializeObject: function (arr) {
            var result = {};
            $.each(arr, function (index, obj) {
                result[obj.name] = obj.value;
            });
            return result;
        },
        /**
         * 判断选择一条记录
         *
         * @param rows 记录
         * @param msg1 为空警告消息
         * @param msg2 多选警告消息
         */
/*        hasOneSelected: function (rows, msg1, msg2) {
            if (!rows.length) {
                $.messager.alert({
                    title: $("#warningtitle").val(),
                    icon: 'warning',
                    msg: msg1 ? msg1 : "请选择一条记录！"
                });
                return false;
            } else if (rows.length > 1) {
                $.messager.alert({
                    title: $("#warningtitle").val(),
                    icon: 'warning',
                    msg: msg2 ? msg2 : "请只选择一条记录，进行操作！"
                });
                return false;
            }
            return true;
        },*/

              hasOneSelected: function (rows, msg1, msg2,titlemsg) {
                    if (!rows.length) {
                        $.messager.alert({
                            title: titlemsg,
                            icon: 'warning',
                            msg: msg1 ? msg1 : "请选择一条记录！"
                        });
                        return false;
                    } else if (rows.length > 1) {
                        $.messager.alert({
                            title: titlemsg,
                            icon: 'warning',
                            msg: msg2 ? msg2 : "请只选择一条记录，进行操作！"
                        });
                        return false;
                    }
                    return true;
                },
        /**
         * 判断选择一些记录
         *
         * @param row 记录
         * @param msg 为空警告消息
         */
/*        hasSomeSelected: function (row, msg) {
            if (!row.length) {
                $.messager.alert({
                    title: $("#warningtitle").val(),//warningtitle
                    icon: 'warning',
                    msg: msg ? msg : "请选择一些记录！"
                });
                return false;
            }
            return true;
        },*/
                hasSomeSelected: function (row, msg ,titlemsg) {
                    if (!row.length) {
                        $.messager.alert({
                            title: titlemsg,//warningtitle
                            icon: 'warning',
                            msg: msg ? msg : "请选择一些记录！"
                        });
                        return false;
                    }
                    return true;
                },
        /**
         * 跟后台交互后的结果提示
         */
        complete: function (result) {
            if (!result) return 0;
            if (typeof result == "string") {
                result = JSON.parse(result);
            }
            $.messager.show({
                title: result.success ? $("#success").text() : $("#failed").text(),
                msg: result.success ? result.msg : '<span style="color:red;">' + result.msg + '</span>',
                iconCls: result.success ? 'icon-ok' : 'icon-cancel'
            });
        },
        toObject: function (result) {
            if (!result) return 0;
            if (typeof result == "string") {
                result = JSON.parse(result);
            }
            return result;
        },
        /**
         * 打开窗口
         * @param options 指定窗口参数
         * @example
         * ************
         * options = {
         *   dd: $("#dialog"),
         *   title: "修改用户",
         *   iconCls: "icon-edit"
         * }
         * ************
         */
        showWindow: function (options) {
            if (options && options.dd) {
                options.dd.dialog({
                    title: options.title,
                    iconCls: options.iconCls,
                    draggable: options.draggable
                }).dialog('open').dialog('center');
            }
        },
        /**
         * 获取填充 字符串
         * @param a 主字符串长度
         * @param b 数字长度
         * ******************
         * Example: a = 5, b = 2,
         *     return "000"
         * ******************
         */
        getFillNumber: function (a, b) {
            var length = a - b,
                result = "";
            for (var i = 0; i < length; i++) {
                result += "0";
            }
            return result;
        },
        /**
         * 获取下一个编号名
         * @param classifyName 当前编号
         */
        getNextClassifyName: function (classifyName) {
            if (!classifyName) return "";
            var temp = classifyName.replace(/[A-Z]|[a-z]|_/g, "");
            var pre = classifyName.replace(new RegExp(temp), "");
            var newId = (+temp + 1) + "";
            var fillNumber = this.getFillNumber(classifyName.length - pre.length, newId.length);
            //生成符合系统规则名字
            return pre + fillNumber + newId;
        },
        /**
         * 获取当前日期
         * @param type 格式化格式类型，如 "-", "/","中文"
         */
        getNowDate: function (type) {
            var str = "";
            var now = new Date();
            if (type === "中文" || type === "zh-CN" || type === "zh" || type === "cn") {
                str = now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日";
            } else {
                str = now.getFullYear() + type + (now.getMonth() + 1) + type + now.getDate();
            }
            return str
        },
        /**
         *  将日期转为一日中最后的时刻
         */
        getNowEndDate: function () {
            var now = new Date();
            return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " 23:59:59";
        },
        getLocalDate: function (str) {
            if (!str) return "";
            var now = new Date(str);
            return now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日";
        },
        getLocalDatetime: function (str) {
            if (!str) return "";
            var now = new Date(str);
            return now.getFullYear() + "-"
                + ((now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)) + "-"
                + (now.getDate() < 10 ? "0" + now.getDate() : now.getDate()) + " "
                + (now.getHours() < 10 ? "0" + now.getHours() : now.getHours()) + ":"
                + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) + ":"
                + (now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds());
        },
        /**
         * 根据日期，时间范围，获取新的日期
         * 如：getDateByRange('2017-03-23', 7) = '2017-03-17'
         */
        getDateByDayRange: function (curDate, range) {
            if (range <= 1) return curDate;
            var date = new Date(curDate);
            var day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            if (day - range > 0) {
                day = day - range;
            } else {
                month = month - 1;
                day = day + this.getMonthDays(year, month);
                day = day - range;
            }
            return year + "-" + month + "-" + (day + 1);
        },
        /**
         * 获取某月的总天数
         */
        getMonthDays: function (year, month) {
            var d = new Date(year, month, 0);
            return d.getDate();
        },
        /**
         * 右键菜单关闭tab
         * @param menu 菜单
         * @param mainTabs 主页tabs
         * @param type 菜单按钮类型，关闭当前等
         */
        closeTab: function (menu, mainTabs, type) {
            var allTabs = mainTabs.tabs('tabs');
            var allTabtitle = [];
            $.each(allTabs, function (i, n) {
                var opt = $(n).panel('options');
                if (opt.closable)
                    allTabtitle.push(opt.title);
            });

            var i, len = allTabtitle.length, curTabTitle;
            switch (type) {
                case 1 :
                    curTabTitle = $(menu).data("tabTitle");
                    mainTabs.tabs("close", curTabTitle);
                    return false;
                    break;
                case 2 :
                    for (i = 0; i < len; i++) {
                        mainTabs.tabs('close', allTabtitle[i]);
                    }
                    break;
                case 3 :
                    curTabTitle = $(menu).data("tabTitle");
                    for (i = 0; i < len; i++) {
                        if (curTabTitle != allTabtitle[i]) {
                            mainTabs.tabs('close', allTabtitle[i]);
                        }
                    }
                    mainTabs.tabs('select', curTabTitle);
                    break;
                case 4 :

                    break;
                case 5 :

                    break;
            }
        },
        transformPercentageToNumber: function (value) {
            if (!/%/.test(value)) return 0;
            value = value.replace(/%/, "");
            return +value && (+value / 100);
        },
        transformNumber: function (value) {
            if (!value)return 0;
            if (!$.isNumeric(value)) return 0;
            return value;
        }
    };

    //maskUtil
    mast.MaskUtil = (function () {

        var $mask, $maskMsg;

        var defMsg = '正在处理，请稍待。。。';

        function init($body) {
            if (!$mask) {
                $mask = $("<div class=\"datagrid-mask mymask\"></div>").appendTo("body");
            }
            if (!$maskMsg) {
                $maskMsg = $("<div class=\"datagrid-mask-msg mymask\">" + defMsg + "</div>")
                    .appendTo("body").css({'font-size': '12px'});
            }

            $mask.css({width: "100%", height: $(document).height()});

            $maskMsg.css({
                left: (($body && $($body).outerWidth(true) / 2) || ($(document.body).outerWidth(true) - 190) / 2),
                top: ($(window).height() - 45) / 2
            });

        }

        return {
            mask: function (msg, $body) {
                init($body);
                $mask.show();
                $maskMsg.html(msg || defMsg).show();
            }
            , unmask: function () {
                $mask.hide();
                $maskMsg.hide();
            }
        }

    }());
}();