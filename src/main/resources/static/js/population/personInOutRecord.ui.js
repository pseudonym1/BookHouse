/**
 * 人员出入统计 ui
 */
!function () {
    var accessTotal = mast.accessTotal = new mast.AccessTotal();

    //布控单元
    var BuildUI = {
        eventInit: function () {
            //监听布控点列表 搜索按钮
            accessTotal.searchBtn.textbox({
                onChange: function (value) {
                    accessTotal.search(value);
                }
            });
        },
        init: function () {
            //初始化楼宇列表
            accessTotal.dataList.datalist({
                url: mast.AccessTotal.URL_LOAD_BUILDING_LIST,
                textField: "name",
                valueField: "id",
                striped: true,
                fit: true,
                fitColumns: true,
                onSelect: function (index, row) {
                    //修改title
                    accessTotal.mainLayout.layout("panel", 'center').panel("setTitle", "人员管理/人员进出记录/" + row.name);
                    //加载分类列表
                    accessTotal.mainGrid.datacard('options').url = mast.AccessTotal.URL_QUERY;
                    accessTotal.mainGrid.datacard('options').pageNumber = 1;
                    var obj = {
                        buildingId: row.id,
                        isMainPanel: 'true'
                    };
                    accessTotal.mainGrid.datacard("load", obj);
                }
            });
        }
    };

    var UIObj = {
        eventInit: function () {
            //监听新增、修改主表单事件
            accessTotal.queryForm.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == "查询") {
                    accessTotal.query();
                }
            })
        },
        init: function () {
            //初始化DataGrid
            accessTotal.mainGrid.datacard({
                // url: mast.AccessTotal.URL_LOAD_GRID,
                /*卡片配置*/
                cardWidth: '20%',
                cardHeight: 'auto',
                multiSortNames: [
                    {field: 'sysClassifyName', title: '编号', width: '120px'}
                ],
                /*卡片配置*/
                idField: 'id',
                toolbar: "#toolbar",
                fitColumns: true,
                fit: true,
                singleSelect: true,
                pageSize: 20,
                pagination: true,
                sortName: 'sysClassifyName',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    var dirPath = "/" + mast.rootDir + "/" + mast.clusterDir + "/";
                    $.each(data.rows, function (index, node) {
                        node.personName = node["personInfo"] == null ? "" : node["personInfo"]["name"];
                        node.imageIp = node["building"]["imageIp"];
                    });
                    return data;
                },
                onDblClickRow: function (index, row) {
                    accessTotal.mainGrid.datagrid("selectRow", index);
                    accessTotal.showUpdateWin(row);
                },
                columns: [[
                    {
                        field: 'coverImageUrl', title: '人员图片', align: 'left', isImage: true,
                        formatter: function (value) {
                            return '<a href="javascript: mast.accessTotal.showPersonInOutWin();" >' + '<img src="' + value + '" >' + '</a>';
                        }
                    },
                    {field: 'sysClassifyName', title: '编号', align: 'left'},
                    {field: 'personName', title: '姓名', align: 'left'},
                    {field: 'imageCount', title: '记录条数', align: 'left'},
                    {field: 'id', hidden: true},
                    {field: 'imageIp', hidden: true}
                ]]
            });

            //初始化出入记录列表
            accessTotal.personInOutGrid.datacard({
                /*卡片配置*/
                cardWidth: '175',
                cardHeight: 'auto',
                multiSortNames: [
                    {field: 'inOutTimestamp', title: '时间', width: '120px'}
                ],
                /*卡片配置*/
                idField: 'id',
                fitColumns: true,
                fit: true,
                pageSize: 30,
                pagination: true,
                sortName: 'inOutTimestamp',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    var dirPath = "/" + mast.rootDir + "/" + mast.clusterDir + "/";
                    $.each(data.rows, function (index, node) {
                        node.imageUrl = "http://" + mast.accessTotal.imageIp + dirPath + node["imageName"];
                    });
                    return data;
                },
                columns: [[
                    {
                        field: 'imageUrl', title: '人员图片', align: 'left', isImage: true,
                        formatter: function (value) {
                            return '<a href="javascript: void(0);" >' + '<img src="' + value + '" >' + '</a>';
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
                    },
                    {
                        field: 'inOutTimestamp', title: '时间', align: 'left'
                    }
                ]]
            });

            //开启fancybox
            // $(".fancybox").fancybox();
        }
    };

    $(document).ready(function () {
        BuildUI.init();
        UIObj.init();
        BuildUI.eventInit();
        UIObj.eventInit();
    });
}();
