!function () {
    var monitorSetting = new mast.MonitorSetting();

    var UIObj = {
        eventInit: function () {
            monitorSetting.mainFormBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim(),
                    dialogTitle = monitorSetting.mainDialog.dialog("options").title;

                if (btnText == mast.constant.SAVE) {
                    if (dialogTitle == mast.MonitorSetting.ADD) {
                        monitorSetting.save(mast.MonitorSetting.ADD);
                    } else if (dialogTitle == mast.MonitorSetting.UPDATE) {
                        monitorSetting.save(mast.MonitorSetting.UPDATE);
                    }
                } else if (btnText == mast.constant.CANCEL) {
                    monitorSetting.cancel();
                }
            });
            monitorSetting.toolbarBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == mast.MonitorSetting.ADD) {
                    monitorSetting.showAddWin();
                } else if (btnText == mast.MonitorSetting.UPDATE) {
                    if (monitorSetting.hasSelected(mast.MonitorSetting.UPDATE)) {
                        monitorSetting.showUpdateWin();
                    }
                } else if (btnText == mast.MonitorSetting.DELETE) {
                    if (monitorSetting.hasSelected(mast.MonitorSetting.DELETE)) {
                        monitorSetting.delete();
                    }
                }
            });
        },
        init: function () {
            var path = window.parent.mast.mainFrame.getTabPath(window.name);
            //初始化列表
            monitorSetting.mainGrid.datagrid({
                title: path.join('/'),
                url: mast.MonitorSetting.URL_LOAD_GRID,
                idField: 'id',
                nowrap: true,//是否只显示一行，即文本过多是否省略部分。
                singleSelect: false, //多选
                fitColumns: true,
                fit: true,
                striped: true,
                rownumbers: true,
                checkOnSelect: true,
                pagination: true,
                pageSize: mast.PAGE_SIZE,
                pageList: mast.PAGE_LIST,
                method: 'post',
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {
                        node.zoneName = node["zone"] == null ? "" : node["zone"]["name"];
                    });
                    return data;
                },
                onDblClickRow: function (index, row) {
                    monitorSetting.mainGrid.datagrid("selectRow", index);
                    monitorSetting.showUpdateWin(row);
                },
                toolbar: "#toolbar",
                columns: [[
                    {field: 'id', checkbox: true},
                    {field: 'zoneName', title: '区域名', align: 'center', width: '20%'},
                    {field: 'faceDatabaseNames', title: '人脸库', align: 'center', width: '20%'},
                    {field: 'startDatetime', title: '开启时间', align: 'center', width: '20%'},
                    {
                        field: 'isStarted', title: '开启操作', align: 'center', width: '10%',
                        formatter: function (value) {
                            if (value) {
                                return "<a href='javascript: (new mast.MonitorSetting()).enable(false);'  >取消开启</a>";
                            } else {
                                return "<a href='javascript: (new mast.MonitorSetting()).enable(true);'  >开启</a>";
                            }
                        }
                    }
                ]]
            })
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
    });
}();
