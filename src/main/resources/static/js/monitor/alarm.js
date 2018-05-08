/**
 * 告警列表 oop
 */
!function () {
    var Alarm = my.Class({
        STATIC: {
            TODAY_ALARM: "今日告警",
            URL_LOAD_GRID: mast.basePath + "/monitor/alarm/loadGrid.json",
            URL_DEAL: mast.basePath + "/monitor/alarm/deal.json",
            URL_QUERY: mast.basePath + "/monitor/alarm/query.json",
            URL_QUERY_INFO: mast.basePath + "/monitor/alarm/queryInfo.json",
            URL_LOAD_FACEDATABASE_LIST: mast.basePath + "/monitor/facedatabase/loadList.json"
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainGrid = $("#mainGrid");
            this.queryForm = $("#toolbar");
            this.mainDialog = $("#mainDialog");
            this.mainForm = $("#mainFrom");
            this.faceDatabaseId = $("#faceDatabaseId");
            this.dateFilter = $("#dateFilter");

            //详情面板
            this.snapshot = $("#snapshot");
            this.photo = $("#photo");
            this.similarity = $("#similarity");
        },
        /**
         * 查询
         */
        query: function () {
            this.mainGrid.datagrid('options').url = Alarm.URL_QUERY;
            var obj = mast.utils.serializeObject(this.queryForm.serializeArray());
            var title = parent.mast.mainFrame.contentTabs.tabs('getSelected').panel('options').title;
            if(title == Alarm.TODAY_ALARM) {
                obj.startDate = mast.utils.getNowDate('-');
            }
            this.mainGrid.datagrid('load', obj);
        },
        dealAlarm: function (type) {
            var self = this;
            $.messager.confirm('提示', '确定要操作这条记录?', function (r) {
                if (r) {
                    var row = self.mainGrid.datagrid('getSelected');
                    $.ajax({
                        url: Alarm.URL_DEAL,
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
        showDetailWin: function (row) {
            var self = this;
            self.clear();
            row = row || self.mainGrid.datagrid("getSelected");
            var photoImage = mast.basePath + "/" + row.monitorPeopleImageFolder + "/" + row.monitorPeopleImageName;
            var snapshotImage = "http://" + row['building'].imageIp + "/" + mast.rootDir + "/" + mast.snapshotDir + "/" +
            row.snapshotImageFolder + "/" + row.snapshotImageName;
            self.snapshot.attr("src", snapshotImage);
            self.photo.attr("src", photoImage);
            self.similarity.text(row.similarity);
            self.loadForm({
                name : row.monitorPeopleName,
                idCard : row.monitorPeopleIdcard,
                gender : row.monitorPeopleGender,
                faceDb : row.monitorFaceDatabaseName
            });
            mast.utils.showWindow({
                dd: self.mainDialog,
                title: '告警人员详情',
                iconCls: 'icon-man'
            });
            //$.ajax({
            //    url: mast.Alarm.URL_QUERY_INFO,
            //    type: "post",
            //    data: {'name': row.monitorPeopleIdcard},
            //    dataType: 'json',
            //    success: function (data) {
            //        self.loadForm(data);
            //        mast.utils.showWindow({
            //            dd: self.mainDialog,
            //            title: '告警人员详情',
            //            iconCls: 'icon-man'
            //        });
            //        //设置对比结果信息
            //        var photoImage = mast.basePath + "/" + row.monitorPeopleImageFolder + "/" + row.monitorPeopleImageName;
            //        var snapshotImage = "http://" + row['building'].imageIp + "/" + mast.rootDir + "/" + mast.snapshotDir + "/"
            //        row.snapshotImageFolder + "/" + row.snapshotImageName;
            //        self.snapshot.attr("src", snapshotImage);
            //        self.photo.attr("src", photoImage);
            //        self.similarity.text(row.similarity);
            //    }
            //});

        },
        clear: function () {
            this.mainForm.form("clear");
        },
        loadForm: function (row) {
            this.mainForm.form("load", row);
        },
        complete: function (result) {
            mast.utils.complete(result);
            mast.utils.reload(this.mainGrid);
        }
    });

    //必须接入全局对象 mast
    mast.Alarm = Alarm;
}();
