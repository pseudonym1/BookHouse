/**
 * 布控信息设置 oop
 */
!function () {
    var MonitorSetting = my.Class({
        STATIC: $.extend({}, mast.STATIC, {
            URL_LOAD_GRID: mast.basePath + "/monitor/setting/loadGrid.json",
            URL_ADD: mast.basePath + "/monitor/setting/add.json",
            URL_UPDATE: mast.basePath + "/monitor/setting/update.json",
            URL_DELETE: mast.basePath + "/monitor/setting/delete.json",
            URL_LOAD_ZONE_LIST: mast.basePath + "/sys/zone/loadList.json",
            URL_LOAD_FACEDATABASE_LIST: mast.basePath + "/monitor/facedatabase/loadList.json",
            URL_ENABLE: mast.basePath + "/monitor/setting/enable.json"
        }),
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainGrid = $("#mainGrid");
            this.mainDialog = $("#mainDialog");
            this.mainForm = $("#mainForm");
            this.mainFormBtns = $("#mainFromButtons");
            this.zoneId = $("#zoneId");
            this.faceDatabaseIds = $("#faceDatabaseIds");
            this.toolbarBtns = $("#toolbar");
        },
        cancel: function () {
            mast.utils.clear([
                this.mainForm
            ]);
            mast.utils.close([
                this.mainDialog
            ]);
        },
        save: function (type) {
            var self = this;
            if (type === MonitorSetting.ADD) {
                self.mainForm.form('submit', {
                    url: MonitorSetting.URL_ADD,
                    success: function (data) {
                        self.complete(data);
                    }
                });
            } else if (type === MonitorSetting.UPDATE) {
                self.mainForm.form('submit', {
                    url: MonitorSetting.URL_UPDATE,
                    onSubmit: function () {
                        return true;
                    },
                    success: function (data) {
                        self.complete(data);
                    }
                });
            }
        },
        delete: function () {
            var self = this;
            $.messager.confirm('提示', '确定要删除这些记录?', function (r) {
                if (r) {
                    var rows = self.mainGrid.datagrid('getSelections');
                    var ids = [];
                    $.each(rows, function (index, item) {
                        ids.push(item.id);
                    });
                    $.ajax({
                        url: MonitorSetting.URL_DELETE,
                        type: 'POST',
                        contentType: "application/json",
                        data: JSON.stringify(ids),
                        dataType: 'json',
                        success: function (data) {
                            self.complete(data);
                        }
                    });
                }
            });
        },
        enable: function (type) {
            var self = this;
            $.messager.confirm('提示', '确定要操作这条记录?', function (r) {
                if (r) {
                    var row = self.mainGrid.datagrid('getSelected');
                    $.ajax({
                        url: MonitorSetting.URL_ENABLE,
                        type: 'POST',
                        data: {id: row.id, type: type},
                        dataType: 'json',
                        success: function (data) {
                            self.complete(data);
                        }
                    });
                }
            });
        },
        showAddWin: function () {
            this.clear();
            this.loadComnobox();
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: MonitorSetting.ADD,
                iconCls: 'icon-add'
            });
        },
        showUpdateWin: function (row) {
            this.clear();
            this.loadComnobox();
            row = row || this.mainGrid.datagrid("getSelected");
            this.mainForm.form("load", row);
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: MonitorSetting.UPDATE,
                iconCls: 'icon-edit'
            });
        },
        loadComnobox: function () {
            this.zoneId.combobox({
                url: mast.MonitorSetting.URL_LOAD_ZONE_LIST,
                valueField: 'id',
                textField: 'name'
            });

            this.faceDatabaseIds.combobox({
                url: mast.MonitorSetting.URL_LOAD_FACEDATABASE_LIST,
                valueField: 'id',
                textField: 'name'
            });
        },
        clear: function () {
            mast.utils.clear([
                this.mainForm
            ]);
        },
        complete: function (result) {
            mast.utils.complete(result);
            mast.utils.close([
                this.mainDialog
            ]);
            mast.utils.reload(this.mainGrid);
        },
        hasSelected: function (type) {
            var msg1, msg2, rows = this.mainGrid.datagrid("getSelections");
            if (type == MonitorSetting.UPDATE) {
                msg1 = "请选择一条布控信息记录，再进行修改操作";
                msg2 = "请只选择一条布控信息记录，再进行修改操作";
                return mast.utils.hasOneSelected(rows, msg1, msg2);
            } else if (type === MonitorSetting.DELETE) {
                msg1 = "请选择一些布控信息记录，再进行删除操作";
                return mast.utils.hasSomeSelected(rows, msg1);
            }
            return false;
        }
    });

    //必须接入全局对象 mast
    mast.MonitorSetting = MonitorSetting;
}();
