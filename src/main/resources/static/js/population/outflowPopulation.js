/**
 * 告警列表 oop
 */
!function () {
    var Outflow = my.Class({
        STATIC: {
            URL_LOAD_GRID: mast.basePath + "/pm/people/loadGridForOutflow.json",
            URL_QUERY: mast.basePath + "/pm/people/queryForOutflow.json",
            URL_PERSON_INFO: mast.basePath + "/pm/personinfo/queryPersonInfo.json",
            URL_LOAD_BUILDING_LIST: mast.basePath + "/sys/building/loadList.json",
            URL_SEARCH: mast.basePath + "/sys/building/search.json",
            URL_UPDATE: mast.basePath + "/pm/people/mark.json"
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainLayout = $("#mainLayout");
            this.mainGrid = $("#mainGrid");
            //楼宇列表
            this.dataList = $("#dataList");
            this.searchBtn = $("#searchBtn");
            //过滤
            this.queryForm = $("#toolbar");
            this.startDate = $("#startDate");
            this.endDate = $("#endDate");
            //标注
            this.personInfoDialog = $("#personInfoDialog");
            this.personInfoForm = $("#personInfoForm");
            this.mainFormBtns = $("#mainForm-buttons");
        },
        //楼宇搜索
        search: function (key) {
            this.dataList.datagrid("options").url = Outflow.URL_SEARCH;
            this.dataList.datagrid("load", {
                name: key
            })
        },
        /**
         * 查询
         */
        query: function () {
            this.mainGrid.datagrid('options').url = Outflow.URL_QUERY;
            var obj = mast.utils.serializeObject(this.queryForm.serializeArray());
            if (obj['like-value']) {
                obj[obj['like-key']] = obj['like-value'];
            }
            if (this.isNotWorkbenchEnter()) {
                var buildingId = this.checkHasBuildingId();
                if (!buildingId) return;
                obj.buildingId = buildingId;
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    obj.buildingId = parent.mast.MainFrame.params.buildingId;
                    obj.startDate = mast.utils.getNowDate('-');
                }
            }
            this.mainGrid.datagrid('load', obj);
        },
        showEditWin: function () {
            this.personInfoForm.form("clear");
            var row = this.mainGrid.datagrid("getSelected");
            this.personInfoForm.form("load", {
                id: row.personId,
                classifyId: row.id,
                name: row.personName,
                gender: row.gender,
                idCard: row.idCard
            });
            mast.utils.showWindow({
                dd: this.personInfoDialog,
                title: '编辑人员信息',
                iconCls: 'icon-edit'
            });
        },
        save: function () {
            var self = this;
            self.personInfoForm.form("submit", {
                url: Outflow.URL_UPDATE,
                onSubmit: function () {
                    return self.personInfoForm.form('validate');
                },
                success: function (data) {
                    mast.utils.complete(data);
                    self.personInfoDialog.dialog("close");
                    self.mainGrid.datagrid("reload");
                }
            })
        },
        close: function () {
            this.personInfoDialog.dialog("close");
        },
        /**
         * 检查是否有选中楼宇
         */
        checkHasBuildingId: function () {
            var row = this.dataList.datagrid("getSelected");
            var buildingId = (row && row.id);
            if (!(buildingId)) {
                $.messager.alert({
                    title: '警告',
                    icon: 'warning',
                    msg: "请先选择一个楼宇，再进行操作！"
                });
                return false;
            }
            return buildingId;
        },
        /**
         * true 不是工作台进入
         */
        isNotWorkbenchEnter: function () {
            var path = window.parent.mast.mainFrame.getTabPath(window.name);
            if (path && path[0]) {
                return path;
            } else {
                return false;
            }
        }
    });

    //必须接入全局对象 mast
    mast.Outflow = Outflow;
}();
