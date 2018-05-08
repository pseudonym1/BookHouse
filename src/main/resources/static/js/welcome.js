/**
 * 欢迎页：工作台。
 */
!function () {
//alert($(".easyui-panel").eq(0).attr("data-options"));
    var Welcome = my.Class({
        STATIC: {
            TITLE: "查看更多",
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.alarmGrid = $("#alarmGrid");
            this.sheriffGrid = $("#mainGridForSheriff");
            this.managerGrid = $("#mainGridForManager");

            //注入父页面mainFrame对象
            this.mainFrame = new parent.mast.MainFrame();
        },

        /**
         * 页面跳转
         */
        jumpToPage: function (options) {
            var entry, text;
            if (options) {
                entry = options.entry;
                text = options.text;
            } else {
                entry = mast.Welcome.URL_LINK_ALARM;
                text = mast.Welcome.ALARM;
            }

            var isExists = this.mainFrame.contentTabs.tabs('exists', text);
            if (isExists) {
                this.mainFrame.contentTabs.tabs('select', text);
                this.mainFrame.refreshTab({title: text, url: entry});
            } else {
                this.mainFrame.createContentTab({
                    text: text,
                    entry: entry
                });
            }
        },
        /**
         * 重置传参
         */
        resetParams: function () {
            this.params = parent.mast.MainFrame.params = {};
        },
        getSelectedBuilding: function () {
            return this.sheriffGrid.datagrid("getSelected");
        },
        /**
         * 处理抓拍图片总览
         */
        dealImageRecord: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_SNAPSHOTS,
                text: Welcome.IMAGE_RECORD
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.jumpToPage(options);
        },
        /**
         * 处理新增人员
         */
        dealNewPerson: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_PERSON,
                text: Welcome.PERSON_ADD
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.params.status = 1;
            this.jumpToPage(options);
        },
        dealExistsPerson: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_PERSON,
                text: Welcome.PERSON
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.params.status = 2;
            this.jumpToPage(options);
        },
        dealPerson: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_PERSON,
                text: Welcome.PERSON
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.params.status = 3;
            this.jumpToPage(options);
        },
        dealResident: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_NEW_RESIDENT_POPULATION,
                text: Welcome.RESIDENT
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.params.status = 1;
            this.jumpToPage(options);
        },
        dealOutflow: function () {
            var row = this.getSelectedBuilding();
            var options = {
                entry: Welcome.URL_LINK_NEW_OUTFLOW_POPULATION,
                text: Welcome.OUTFLOW
            };
            this.resetParams();
            this.params.buildingId = +row.id;
            this.params.buildingName = row.name;
            this.params.status = 1;
            this.jumpToPage(options);
        },
        showDetailWin: function (row) {
            var self = this;
            self.clear();
            $.ajax({
                url: Welcome.URL_QUERY_INFO,
                type: "post",
                data: {'name': row.monitorPeopleName},
                dataType: 'json',
                success: function (data) {
                    self.loadForm(data);
                    mast.utils.showWindow({
                        dd: self.mainDialog,
                        title: '告警人员详情',
                        iconCls: 'icon-man'
                    });
                }
            });

        },
        dealAlarm: function (type) {
            var self = this;
            var row = this.alarmGrid.datagrid("getSelected");
            $.messager.confirm('提示', '确定要处理这条告警记录?', function (r) {
                if (r) {
                    $.ajax({
                        url: Welcome.URL_DEAL,
                        type: 'POST',
                        data: {id: row.id, type: type},
                        dataType: 'json',
                        success: function (data) {
                            mast.utils.complete(data);
                            self.alarmGrid.datagrid("reload");
                        }
                    });
                }
            });
        },
        clear: function () {
            this.mainForm.form("clear");
        },
        loadForm: function (row) {
            this.mainForm.form("load", row);
        }
    });

    //必须接入全局对象 mast
    mast.Welcome = Welcome;
}();

!function () {
    var welcome = mast.welcome = new mast.Welcome();
    var UIObj = {
        eventInit: function () {
            setInterval(function () {
                welcome.sheriffGrid.datagrid("reload");
            }, 60 * 1000);

        },
        init: function () {
        },
        extraInit: function () {
            //开启fancybox
            $(".fancybox").fancybox();
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
        UIObj.extraInit();

    });
}();