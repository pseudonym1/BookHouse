/**
 * 人员出入统计 ui
 */
!function () {

    var imageRecord = mast.imageRecord = new mast.ImageRecord();

    var UIObj = {
        eventInit: function () {
            //监听布控点列表 搜索按钮
            imageRecord.searchBtn.textbox({
                onChange: function (value) {
                    imageRecord.search(value);
                }
            });

            //监听新增、修改主表单事件
            imageRecord.queryForm.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == "查询") {
                    imageRecord.query();
                } else if (btnText == "图表统计") {
                    imageRecord.showEChartsWin(mast.ImageRecord.TO_DAY);
                }
            });

            //监听图表弹窗按钮
            imageRecord.eChartsButtons.find("a").click(function () {
                var $this = $(this),
                    $parent = $this.parent(),
                    btnText = $this.text().trim();
                $parent.find("a").removeClass("c7");
                if (btnText == mast.ImageRecord.TO_DAY) {
                    imageRecord.showEChartsWin(mast.ImageRecord.TO_DAY);
                    $this.addClass("c7");
                } else if (btnText == mast.ImageRecord.TO_WEEK) {
                    imageRecord.showEChartsWin(mast.ImageRecord.TO_WEEK);
                    $this.addClass("c7");
                } else if (btnText == mast.ImageRecord.TO_MONTH) {
                    imageRecord.showEChartsWin(mast.ImageRecord.TO_MONTH);
                    $this.addClass("c7");
                }
            });
        },
        init: function () {
            //初始化楼宇列表
            imageRecord.dataList.datalist({
                url: mast.ImageRecord.URL_LOAD_BUILDING_LIST,
                textField: "name",
                valueField: "id",
                striped: true,
                fit: true,
                fitColumns: true,
                onSelect: function (index, row) {
                    //修改title
                    imageRecord.mainLayout.layout("panel", 'center').panel("setTitle", "人员管理/抓拍记录总览/" + row.name);
                    //加载分类列表
                    imageRecord.mainGrid.datacard('options').url = mast.ImageRecord.URL_QUERY;
                    imageRecord.mainGrid.datacard('options').pageNumber = 1;
                    var obj = {
                        buildingId: row.id,
                        isMainPanel: 'true'
                    };
                    imageRecord.mainGrid.datacard("load", obj);
                }
            });

            //初始化DataGrid
            imageRecord.mainGrid.datacard({
                // url: mast.ImageRecord.URL_LOAD_GRID,
                /******新增属性******/
                cardWidth: '20%',
                cardHeight: 'auto',
                multiSortNames: [
                    {field: 'imageTimestamp', title: '时间', width: '120px'}
                ],
                /***********/
                idField: 'id',
                toolbar: "#toolbar",
                fit: true,
                pagination: true,
                pageSize: 20,
                singleSelect: true,
                sortName: 'imageTimestamp',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    var dirPath = "/" + mast.rootDir + "/" + mast.snapshotDir + "/";
                    $.each(data.rows, function (index, node) {
                        node.buildingName = node["building"] == null ? "" : node["building"]["name"];
                        node.imageUrl = "http://" + node["building"]["imageIp"] + dirPath + node["imageFolder"] + "/"
                            + node["imageName"];
                    });
                    return data;
                },
                columns: [[
                    {
                        field: 'imageUrl', title: '现场图片', align: 'left', isImage: true,
                        formatter: function (value) {
                            return '<a href="' + value + '" class="fancybox" >' + '<img src="' + value + '" >' + '</a>';
                        }
                    },
                    {
                        field: 'imageTimestamp', title: '时间', align: 'left', sortable: true,
                        sorter: function (a, b) {
                            return ((new Date(a)).getTime() > (new Date(b)).getTime() ? 1 : -1);
                        }
                    },
                    {
                        field: 'direction', title: '方向', align: 'left',
                        formatter: function (value) {
                            if (value === 1) {
                                return "出口";
                            } else if (value === 2) {
                                return "入口";
                            }
                        }
                    }
                    // {
                    //     field: 'op', title: '操作', align: 'left',
                    //     formatter: function () {
                    //         return '<a href="javascript: mast.imageRecord.addAlarm();">添加告警</a>';
                    //     }
                    // }
                ]]
            });
        },
        extraInit: function () {
            var panel = imageRecord.mainLayout.layout("panel", 'center');
            var path = imageRecord.isNotWorkbenchEnter();
            if (path) {
                panel.panel("setTitle", path[0] + "/" + path[1]);
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    //修改panel title
                    panel.panel("setTitle", "工作台/今日抓拍/" + parent.mast.MainFrame.params.buildingName);
                    //隐藏部分查询字段
                    imageRecord.mainLayout.layout("collapse", 'west');
                    imageRecord.startDate.hide();
                    imageRecord.endDate.hide();
                    $.each(imageRecord.eChartsButtons.find("a"), function (index, node) {
                        if (index > 0) {
                            $(node).hide();
                        }
                    });
                    //加载 主grid
                    imageRecord.mainGrid.datacard('options').url = mast.ImageRecord.URL_QUERY;
                    var obj = {
                        buildingId: parent.mast.MainFrame.params.buildingId,
                        startDate: mast.utils.getNowDate("-")
                    };
                    imageRecord.mainGrid.datacard("load", obj);
                }
            }

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
