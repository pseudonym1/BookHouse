/**
 * 人员出入统计 oop
 */
!function () {
    var AccessTotal = my.Class({
        STATIC: {
            URL_LOAD_GRID: mast.basePath + "/pm/accesstotal/loadGrid.json",
            URL_QUERY: mast.basePath + "/pm/accesstotal/query.json",
            URL_LOAD_IN_OUT_GRID: mast.basePath + "/pm/accesstotal/loadInOutRecord.json",
            URL_PERSON_INFO: mast.basePath + "/pm/personinfo/queryPersonInfo.json",
            URL_LOAD_BUILDING_LIST: mast.basePath + "/sys/building/loadList.json",
            URL_SEARCH: mast.basePath + "/sys/building/search.json"
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainGrid = $("#mainGrid");
            this.queryForm = $("#toolbar");
            this.buildingId = $("#buildingId");
            this.personInOutDialog = $("#personInOutDialog");
            this.personInOutGrid = $("#inOutGrid");
            this.dataList = $("#dataList");
            this.searchBtn = $("#searchBtn");
            this.mainLayout = $("#mainLayout");
        },
        //楼宇搜索
        search: function (key) {
            this.dataList.datagrid("options").url = AccessTotal.URL_SEARCH;
            this.dataList.datagrid("load", {
                name: key
            })
        },
        /**
         * 查询
         */
        query: function () {
            this.mainGrid.datacard('options').url = AccessTotal.URL_QUERY;
            var obj = mast.utils.serializeObject(this.queryForm.serializeArray());
            if (obj['like-value']) {
                obj[obj['like-key']] = obj['like-value'];
            }
            var buildingId = this.checkHasBuildingId();
            if (!buildingId) return;
            obj.buildingId = buildingId;
            this.mainGrid.datacard('load', obj);
        },
        queryPersonInfo: function () {
            var self = this;
            var row = self.mainGrid.datagrid("getSelected");
            $.ajax({
                url: AccessTotal.URL_PERSON_INFO,
                type: 'POST',
                data: {id: row.id},
                dataType: 'json',
                success: function (data) {
                    self.showPersonInfoWin(data);
                }
            });
        },
        showPersonInfoWin: function (data) {
            this.personInfoForm.form("load", data);
            mast.utils.showWindow({
                dd: this.personInfoDialog,
                title: '人员详情',
                iconCls: "icon-man"
            })
        },
        showPersonInOutWin: function () {
            var obj = this.mainGrid.datacard('getSelected');
            mast.accessTotal.imageIp = obj.imageIp;
            mast.utils.showWindow({
                dd: this.personInOutDialog,
                title: '(' + obj.sysClassifyName + ')的出入记录',
                iconCls: "icon-man"
            });
            this.personInOutGrid.datacard('options').url = AccessTotal.URL_LOAD_IN_OUT_GRID;
            this.personInOutGrid.datacard('load', obj);
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
        }
    });

    //必须接入全局对象 mast
    mast.AccessTotal = AccessTotal;
}();

