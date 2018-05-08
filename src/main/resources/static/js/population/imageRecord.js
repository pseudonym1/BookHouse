/**
 * 人员出入统计 oop
 */
!function () {
    var ImageRecord = my.Class({
        STATIC: {
            TO_DAY: "今日统计",
            TO_WEEK: "一周统计",
            TO_MONTH: "一个月统计",
            URL_LOAD_GRID: mast.basePath + "/pm/imagerecord/loadGrid.json",
            URL_QUERY: mast.basePath + "/pm/imagerecord/query.json",
            URL_LOAD_BUILDING_LIST: mast.basePath + "/sys/building/loadList.json",
            URL_SEARCH: mast.basePath + "/sys/building/search.json",
            URL_QUERY_ANALYSIS: mast.basePath + "/pm/imagerecord/queryForAnalysis.json"
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainPanel = $("#mainPanel");
            this.mainGrid = $("#mainGrid");
            this.queryForm = $("#toolbar");

            //过滤条件字段
            this.startDate = $("#startDate");
            this.endDate = $("#endDate");
            this.buildingName = $("#buildingName");

            //布控列表
            this.dataList = $("#dataList");
            this.searchBtn = $("#searchBtn");
            this.mainLayout = $("#mainLayout");
            this.buildingList = $("#buildingList");

            //图表
            this.eChartsDialog = $("#eChartsDialog");
            this.eChartsContainer = $("#eChartsContainer");
            this.eChartsButtons = $("#eCharts-buttons");
            this.eCharts = {};
            this.eChartsOptions = {};
        },
        //楼宇搜索
        search: function (key) {
            this.dataList.datagrid("options").url = ImageRecord.URL_SEARCH;
            this.dataList.datagrid("load", {
                name: key
            })
        },
        /**
         * 查询
         */
        query: function () {
            this.mainGrid.datacard('options').url = ImageRecord.URL_QUERY;
            var obj = mast.utils.serializeObject(this.queryForm.serializeArray());
            if (this.isNotWorkbenchEnter()) {
                var buildingId = this.checkHasBuildingId();
                if (!buildingId) return;
                obj.buildingId = buildingId;
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    obj.buildingId = parent.mast.MainFrame.params.buildingId;
                    obj.startDate = mast.utils.getNowDate("-")
                }
            }
            this.mainGrid.datacard('load', obj);
        },
        /**
         * 分析抓拍图片
         */
        analysisRecord: function (type, param) {
            var self = this;
            if (type === ImageRecord.TO_DAY) {
                param.startDate = mast.utils.getNowDate('-');
            } else if (type === ImageRecord.TO_WEEK) {
                param.endDate = mast.utils.getNowEndDate();
                param.startDate = mast.utils.getDateByDayRange(param.endDate, 7);
            } else if (type === ImageRecord.TO_MONTH) {
                param.endDate = mast.utils.getNowEndDate();
                param.startDate = mast.utils.getDateByDayRange(param.endDate, 30);
            }
            param.xAxis = ['00:00:00', '05:59:59', '06:00:00', '07:59:59', '08:00:00', '09:59:59', '10:00:00', '11:59:59', '12:00:00'
                , '13:59:59', '14:00:00', '15:59:59', '16:00:00', '17:59:59', '18:00:00', '19:59:59', '20:00:00', '21:59:59', '22:00:00'
                , '23:59:59'].join(",");
            $.ajax({
                url: ImageRecord.URL_QUERY_ANALYSIS,
                type: 'post',
                data: param,
                dataType: 'json',
                success: function (result) {
                    self.drawECharts(result, type);
                }
            });
        },
        drawECharts: function (data, type) {
            if (!data) return;
            var seriesData = [], total = 0;
            $.each(data, function (index, num) {
                seriesData.push(num);
                total += num;
            });
            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: type + (total > 0 ? "(总记录数：" + total + ")" : "")
                },
                tooltip: {},
                legend: {
                    data: ['抓拍记录数']
                },
                xAxis: {
                    data: ["0-5(时)", "6-7(时)", "8-9(时)", "10-11(时)", "12-13(时)", "14-15(时)", "16-17(时)", "18-19(时)"
                        , "20-21(时)", "22-23(时)"]
                },
                yAxis: {
                    name: '抓拍记录数(张照片)'
                },
                series: [{
                    name: '抓拍记录数',
                    type: 'bar',
                    data: seriesData
                }]
            };
            //实例化ECharts
            this.eCharts = echarts.init(this.eChartsContainer.get(0));
            this.eCharts.setOption(option);
        },
        showEChartsWin: function (type) {
            var self = this, param = {};
            if (self.isNotWorkbenchEnter()) {
                param.buildingId = self.checkHasBuildingId();
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    param.buildingId = parent.mast.MainFrame.params.buildingId;
                }
            }
            if (!param.buildingId) return;

            self.analysisRecord(type, param);
            mast.utils.showWindow({
                dd: self.eChartsDialog,
                title: '抓拍记录统计',
                iconCls: 'icon-chart',
                draggable: false
            });
        },
        /**
         * 检查是否有选中楼宇
         */
        checkHasBuildingId: function () {
            var path = window.parent.mast.mainFrame.getTabPath(window.name);
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
    mast.ImageRecord = ImageRecord;
}();

