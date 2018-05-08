/**
 * 页面初始化
 */
!function () {

    var classify = mast.classify = new mast.Classify();

    var UIObj = {
        eventInit: function () {
            //监听布控点列表 搜索按钮
            classify.searchBtn.textbox({
                onChange: function (value) {
                    classify.search(value);
                }
            });
            //监听人员列表 工具栏
            classify.queryForm.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == mast.Classify.QUERY) {
                    classify.query();
                } else if (btnText == mast.Classify.MARK) {
                    if (classify.hasSelected(mast.Classify.MARK)) {
                        classify.showUpdateWin();
                    }
                }
            });
            //监听标注个人信息对话框 操作按钮
            classify.mainFormBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim(),
                    dialogTitle = classify.mainDialog.dialog("options").title;

                if (btnText == mast.Classify.SAVE) {
                    if (dialogTitle == mast.Classify.MARK) {
                        classify.save();
                    } else {
                        return 0;
                    }
                } else if (btnText == mast.Classify.CANCEL) {
                    classify.close();
                }
            });
            //监听图库工具栏
            classify.photoGalleryToolbar.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == mast.Classify.DELETE_PHOTO) {
                    if (classify.hasSelected(mast.Classify.DELETE_PHOTO)) {
                        classify.deleteFiles();
                    }
                } else if (btnText == mast.Classify.MOVE_GOALS) {
                    if (classify.hasSelected(mast.Classify.MOVE_GOALS)) {
                        classify.showMoveWin();
                    }
                }
            });
            //监听移动目标工具栏
            classify.photoMoveToolbar.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == mast.Classify.SAVE_ADJUST) {
                    if (classify.hasSelected(mast.Classify.SAVE_ADJUST)) {
                        classify.adjust();
                    }
                } else if (btnText == mast.Classify.ADJUST_NEW_CLASSIFY) {
                    classify.adjustToNewClassify();
                } else if(btnText == mast.Classify.QUERY) {
                    classify.adjustQueryClassify();
                }
            });
            //监听移动弹窗关闭按钮
            classify.photoMoveGridDlg.dialog({
                onClose: function () {
                    classify.photoGalleryGrid.datacard('reload');
                }
            });
            //监听个人图库关闭按钮
            classify.photoGalleryDlg.dialog({
                onClose: function () {
                    classify.mainGrid.datacard('reload');
                }
            });
        },
        init: function () {
            //初始化布控单元列表
            classify.dataList.datalist({
                url: mast.Classify.URL_LOAD_BUILDING_LIST,
                textField: "name",
                valueField: "id",
                striped: true,
                fit: true,
                fitColumns: true,
                onSelect: function (index, row) {
                    classify.mainLayout.layout("panel", 'center').panel('setTitle', "人员管理/人员标注/" + row.name);
                    //加载主列表
                    var obj = {};
                    var buildingId = classify.checkHasBuildingId();
                    if (!buildingId) return;
                    obj.buildingId = buildingId;
                    classify.mainGrid.datacard('options').url = mast.Classify.URL_CLASSIFY_QUERY;
                    classify.mainGrid.datacard('options').pageNumber = 1;
                    classify.mainGrid.datacard('load', obj);
                }
            });

            //加载人员列表
            classify.mainGrid.datacard({
                /*卡片配置*/
                cardWidth: '20%',
                cardHeight: 'auto',
                checkbox: true,
                multiSortNames: [
                    {field: 'sysClassifyName', title: '编号', width: '120px'}
                ],
                /*卡片配置*/
                idField: 'id',
                toolbar: "#toolbar",
                fit: true,
                pagination: true,
                pageSize: 20,
                singleSelect: true,
                sortName: 'sysClassifyName',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {
                        node.personName = node["personInfo"] == null ? "" : node["personInfo"]["name"];
                        node.personIdCard = node["personInfo"] == null ? "" : node["personInfo"]["idCard"];
                        node.personId = node["personInfo"] == null ? "" : node["personInfo"]["id"];
                        node.gender = node["personInfo"] == null ? "" : node["personInfo"]["gender"];
                        node.imageIp = node["building"]["imageIp"];
                    });
                    return data;
                },
                columns: [[
                    {
                        field: 'coverImageUrl', title: '人员图片', align: 'left', isImage: true,
                        formatter: function (value) {
                            return '<a href="javascript: mast.classify.showPhotoGalleryWin();" >' + '<img src="' + value + '" >' + '</a>';
                        }
                    },
                    {field: 'sysClassifyName', title: '编号', align: 'left'},
                    {field: 'imageCount', title: '记录条数', align: 'left'},
                    {
                        field: 'createAt', title: '创建时间', align: 'left',
                        formatter: function (value) {
                            return mast.utils.getLocalDate(value);
                        }
                    },
                    {field: 'personName', title: '姓名', align: 'left'},
                    {field: 'id', hidden: true},
                    {field: 'buildingId', hidden: true},
                    {field: 'imageFolder', hidden: true},
                    {field: 'imageIp', hidden: true},
                    {field: 'personId', hidden: true},
                    {field: 'gender', hidden: true},
                    {field: 'personIdCard', hidden: true}
                ]]
            });

            //初始化图库
            classify.photoGalleryGrid.datacard({
                cardWidth: '175',
                cardHeight: 'auto',
                checkbox: true,
                multiSortNames: [
                    {field: 'id', checkbox: true},
                    {field: 'inOutTimestamp', title: '时间', width: '120px'}
                ],
                idField: 'id',
                fit: true,
                toolbar: "#photoGalleryToolbar",
                pagination: true,
                pageSize: 30,
                sortName: 'inOutTimestamp',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    var dirPath = "/" + mast.rootDir + "/" + mast.clusterDir + "/";
                    $.each(data.rows, function (index, node) {
                        node.imageUrl = "http://" + mast.classify.imageIp + dirPath + node["imageName"];
                    });
                    if (data.rows < 1) {
                        classify.closePhotoGalleryWin();
                    }
                    return data;
                },
                onBeforeSelect: function (index) {
                    if (!classify.photoGalleryGrid.datacard('hasSelected', index)) {
                        ++mast.classify.totalNumber;
                    }
                    classify.selectTotal.text(mast.classify.totalNumber);
                },
                onUnSelect: function () {
                    var num = --mast.classify.totalNumber;
                    classify.selectTotal.text(num);
                },
                onSelectAll: function (rows) {
                    var num = rows && rows.length;
                    classify.selectTotal.text(num || 0);

                },
                onUnSelectAll: function () {
                    var num = mast.classify.totalNumber = 0;
                    classify.selectTotal.text(num);
                },
                onLoadSuccess: function () {
                    var num = mast.classify.totalNumber = 0;
                    classify.selectTotal.text(num);
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
                    },
                    {field: 'imageName', hidden: true}
                ]]
            });

            //初始化移动到目标列表
            classify.photoMoveGrid.datacard({
                /*卡片配置*/
                cardWidth: '10%',
                cardHeight: 'auto',
                imgMaxHeight: 80,
                imgMaxWidth: 80,
                showBackgroundFolder: true,
                checkbox: true,
                multiSortNames: [
                    {field: 'sysClassifyName', title: '编号', width: '120px'}
                ],
                /*卡片配置*/
                idField: 'id',
                toolbar: "#photoMoveToolbar",
                fit: true,
                pagination: true,
                pageSize: 50,
                singleSelect: true,
                sortName: 'sysClassifyName',
                sortOrder: 'desc',
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {
                        node.personName = node["personInfo"] == null ? "" : node["personInfo"]["name"];
                        node.imageIp = node["building"]["imageIp"];
                    });
                    return data;
                },
                onSelect: function (index, row) {
                    var title = classify.photoMoveGridDlg.dialog('options').title;
                    title = title + "<span style='color:#b52b27'>" + row.sysClassifyName + "</span>";
                    classify.photoMoveGridDlg.dialog('setTitle', title);
                },
                onUnSelect: function () {
                    var title = classify.photoMoveGridDlg.dialog('options').title;
                    title = title.substring(0, title.indexOf("：") + 1);
                    classify.photoMoveGridDlg.dialog('setTitle', title);
                },
                onLoadSuccess: function () {
                    var title = classify.photoMoveGridDlg.dialog('options').title;
                    title = title.substring(0, title.indexOf("：") + 1);
                    classify.photoMoveGridDlg.dialog('setTitle', title);
                },
                columns: [[
                    {
                        field: 'coverImageUrl', title: '人员图片', align: 'left', isImage: true,
                        formatter: function (value) {
                            return '<a href="javascript: void(0);" >' + '<img src="' + value + '" style="max-height: 80px;max-width: 80px;">' + '</a>';
                        }
                    },
                    {field: 'sysClassifyName', noTitle: true, align: 'center'},
                    {field: 'imageFolder', hidden: true},
                    {field: 'id', hidden: true}
                ]]
            });
        },
        extraInit: function () {
            var panel = classify.mainLayout.layout("panel", 'center');
            var path = classify.isNotWorkbenchEnter();
            if (path) {
                panel.panel("setTitle", path[0] + "/" + path[1]);
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    //修改panel title
                    var str = "";
                    var status = parent.mast.MainFrame.params.status;
                    if (status == 1) {
                        str += "工作台/今日新增/";
                    } else if (status == 2) {
                        str += "工作台/今日出现/";
                    }
                    str += parent.mast.MainFrame.params.buildingName;
                    panel.panel('setTitle', str);
                    //隐藏楼宇列表
                    classify.mainLayout.layout("collapse", 'west');
                    classify.filterDate.hide();
                    // //加载 主grid
                    var obj = {
                        buildingId: parent.mast.MainFrame.params.buildingId,
                        status: status,
                        startDate: mast.utils.getNowDate("-")
                    };
                    classify.mainGrid.datacard('options').url = mast.Classify.URL_LOAD_GRID_Workbench;
                    classify.mainGrid.datacard('load', obj);
                }
            }
            //开启fancybox
            // $(".fancybox").fancybox();
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
        UIObj.extraInit();
    });
}();