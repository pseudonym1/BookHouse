/**
 * 告警列表UI
 */
!function () {
    var alarm = mast.alarm = new mast.Alarm();

    var UIObj = {
        eventInit: function () {
            //监听新增、修改主表单事件
            alarm.queryForm.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == "查询") {
                    alarm.query();
                }
            })
        },
        init: function () {
            //初始化人脸库列表
            alarm.faceDatabaseId.combobox({
                url: mast.Alarm.URL_LOAD_FACEDATABASE_LIST,
                valueField: 'id',
                textField: 'name'
            });

            var titlePath;
            if (window.name.indexOf('iframe_name') >= 0) {
                titlePath = '工作台/今日告警';
            } else {
                var path = window.parent.mast.mainFrame.getTabPath(window.name);
                titlePath = path.join('/');
            }

            //初始化DataGrid
            alarm.mainGrid.datagrid({
                title: titlePath,
                idField: 'id',
                toolbar: "#toolbar",
                fitColumns: true,
                fit: true,
                striped: true,
                singleSelect: true,
                pagination: true,
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {
                        node.buildingName = node["building"] == null ? "" : node["building"]["name"];
                    });
                    return data;
                },
                onDblClickRow: function (index, row) {
                    alarm.mainGrid.datagrid("selectRow", index);
                    alarm.showDetailWin(row);
                },
                columns: [[
                    {
                        field: "snapshotImage", title: '现场图', align: 'center', width: '12%',
                        formatter: function (val, row) {
                            var src = "http://" + row['building'].imageIp + "/" + mast.rootDir + "/" + mast.snapshotDir + "/" +
                                row.snapshotImageFolder + "/" + row.snapshotImageName;
                            return '<a href="' + src + '" class="fancybox" >' + '<img src="' + src + '" ' +
                                'style="max-height: 110px;max-width: 110px;" >' + '</a>';
                        }
                    },
                    {field: 'similarity', title: '相似度', align: 'center', width: '5%'},
                    {
                        field: "monitoredImage", title: '证件照', align: 'center', width: '12%',
                        formatter: function (val, row) {
                            var src = mast.basePath + "/" + row.monitorPeopleImageFolder + "/" + row.monitorPeopleImageName;
                            return '<a href="' + src + '" class="fancybox" >' + '<img src="' + src + '" ' +
                                'style="max-height: 110px;max-width: 110px;" >' + '</a>';
                        }
                    },
                    {field: 'monitorPeopleName', title: '疑似人员', align: 'center', width: '10%'},
                    {field: 'alarmTimestamp', title: '时间', align: 'center', width: '10%'},
                    {field: 'buildingName', title: '告警地点', align: 'center', width: '10%'},
                    {field: 'monitorFaceDatabaseName', title: '人脸库', align: 'center', width: '10%'},
                    {
                        field: 'isHandled', title: '告警处理', align: 'center', width: '10%',
                        formatter: function (value) {
                            if (value) {
                                return "<a href='javascript: mast.alarm.dealAlarm(false);'  >取消处理</a>";
                            } else {
                                return "<a href='javascript: mast.alarm.dealAlarm(true);'  >处理</a>";
                            }
                        }
                    },
                    {field: 'id', hidden: true}
                ]]
            });
        },
        extraInit: function () {
            var obj = {};
            var title = parent.mast.mainFrame.contentTabs.tabs('getSelected').panel('options').title;
            if (title == mast.Alarm.TODAY_ALARM) {
                //隐藏时间过滤
                alarm.dateFilter.hide();
                obj.startDate = mast.utils.getNowDate('-');
            }
            alarm.mainGrid.datagrid('options').url = mast.Alarm.URL_QUERY;
            alarm.mainGrid.datagrid('load', obj);

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
