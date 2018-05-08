/**
 * 常住人口UI
 */
!function () {
    var outflow = mast.outflow = new mast.Outflow();

    var UIObj = {
        eventInit: function () {
            //监听布控点列表 搜索按钮
            outflow.searchBtn.textbox({
                onChange: function (value) {
                    outflow.search(value);
                }
            });
            //监听新增、修改主表单事件
            outflow.queryForm.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == "查询") {
                    outflow.query();
                }
            });
            //监听标注个人信息对话框 操作按钮
            outflow.mainFormBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();

                if (btnText == "保存") {
                    outflow.save();
                } else if (btnText == "取消") {
                    outflow.close();
                }
            });
        },
        init: function () {
            //初始化楼宇列表
            outflow.dataList.datalist({
                url: mast.Outflow.URL_LOAD_BUILDING_LIST,
                textField: "name",
                valueField: "id",
                striped: true,
                fit: true,
                fitColumns: true,
                onSelect: function (index, row) {
                    //加载分类列表
                    outflow.mainGrid.datagrid('options').url = mast.Outflow.URL_QUERY;
                    outflow.mainLayout.layout("panel", 'center').panel('setTitle', "人员管理/流出人员列表/" + row.name);
                    var obj = {
                        buildingId: row.id,
                        isMainPanel: 'true'
                    };
                    outflow.mainGrid.datagrid("load", obj).datagrid("clearSelections");
                }
            });

            //初始化DataGrid
            outflow.mainGrid.datagrid({
                // url: mast.Outflow.URL_LOAD_GRID,
                idField: 'id',
                toolbar: "#toolbar",
                fitColumns: true,
                fit: true,
                striped: true,
                checkOnSelect: true,
                singleSelect: true,
                pagination: true,
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {
                        node.buildingName = node["building"] == null ? "" : node["building"]["name"];
                        node.personName = node["personInfo"] == null ? "" : node["personInfo"]["name"];
                        node.gender = node["personInfo"] == null ? "" : node["personInfo"]["gender"];
                        node.idCard = node["personInfo"] == null ? "" : node["personInfo"]["idCard"];
                    });
                    return data;
                },
                columns: [[
                    {field: 'sysClassifyName', title: '编号', align: 'center', width: '10%'},
                    {field: 'personName', title: '姓名', align: 'center', width: '10%'},
                    {
                        field: 'gender', title: '性别', align: 'center', width: '8%',
                        formatter: function (value) {
                            if (value == 1) {
                                return "男";
                            } else if (value == 2) {
                                return "女";
                            }
                        }
                    },
                    {field: 'idCard', title: '身份证', align: 'center', width: '12%'},
                    {
                        field: 'coverImageUrl', title: '人员图片', align: 'center', width: '20%',
                        formatter: function (value) {
                            return '<a href="' + value + '" class="fancybox" >' + '<img src="' + value + '" ' +
                                'style="max-height: 110px;max-width: 110px;" >' + '</a>';
                        }
                    },
                    {
                        field: 'createAt', title: '标注常住人口日期', align: 'center', width: '15%',
                        formatter: function (value) {
                            return mast.utils.getLocalDate(value);
                        }
                    },
                    {
                        field: 'permanentOutflowLabelDatetime', title: '标注流出人口日期', align: 'center', width: '15%',
                        formatter: function (value) {
                            return mast.utils.getLocalDate(value);
                        }
                    },
                    {
                        field: 'op', title: '操作', width: '10%',
                        formatter: function () {
                            return "<a href='javascript: mast.outflow.showEditWin();'>编辑</a>";
                        }
                    },
                    {field: 'id', hidden: true}
                ]]
            });
        },
        extraInit: function () {
            var panel = outflow.mainLayout.layout("panel", 'center');
            var path = outflow.isNotWorkbenchEnter();
            if (path) {
                panel.panel("setTitle", path[0] + "/" + path[1]);
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    //修改panel title
                    panel.panel("setTitle", "工作台/今日流出/" + parent.mast.MainFrame.params.buildingName);
                    //隐藏部分查询字段
                    outflow.startDate.hide();
                    outflow.endDate.hide();
                    outflow.mainLayout.layout("collapse", 'west');
                    //加载 主grid
                    outflow.mainGrid.datagrid('options').url = mast.Outflow.URL_QUERY;
                    var obj = {
                        buildingId: parent.mast.MainFrame.params.buildingId,
                        status: parent.mast.MainFrame.params.status,
                        startDate: mast.utils.getNowDate("-")
                    };
                    outflow.mainGrid.datagrid("load", obj).datagrid("clearSelections");
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
