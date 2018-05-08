/**
 * 人脸库 UI
 */
!function () {
    var faceDatabase = mast.faceDatabase = new mast.FaceDatabase();

    var UIObj = {
        eventInit: function () {
            //监听新增、修改主表单事件
            faceDatabase.mainFormBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim(),
                    dialogTitle = faceDatabase.mainDialog.dialog("options").title;

                if (btnText === mast.constant.SAVE) {
                    if (dialogTitle === mast.FaceDatabase.ADD) {
                        faceDatabase.save(mast.FaceDatabase.ADD);
                    } else if (dialogTitle === mast.FaceDatabase.UPDATE) {
                        faceDatabase.save(mast.FaceDatabase.UPDATE);
                    }
                } else if (btnText === mast.constant.CANCEL) {
                    faceDatabase.close();
                }
            });
            faceDatabase.toolbarBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();
                if (btnText == mast.FaceDatabase.ADD) {
                    faceDatabase.showAddWin();
                } else if (btnText == mast.FaceDatabase.UPDATE) {
                    if (faceDatabase.hasSelected(mast.FaceDatabase.UPDATE)) {
                        faceDatabase.showUpdateWin();
                    }
                } else if (btnText == mast.FaceDatabase.DELETE) {
                    if (faceDatabase.hasSelected(mast.FaceDatabase.DELETE)) {
                        faceDatabase.delete();
                    }
                }
            });
        },
        init: function () {
            var path = window.parent.mast.mainFrame.getTabPath(window.name);
            //初始化DataGrid
            faceDatabase.mainGrid.datagrid({
                title: path.join('/'),
                url: mast.FaceDatabase.URL_LOAD_GRID,
                idField: 'id',
                fitColumns: true,
                fit: true,
                striped: true,
                singleSelect: true,
                rownumbers: true,
                pagination: true,
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {

                    });
                    return data;
                },
                onDblClickRow: function (index, row) {
                    faceDatabase.mainGrid.datagrid("selectRow", index);
                    faceDatabase.showUpdateWin(row);
                },
                columns: [[
                    // {field: 'id', checkbox: true},
                    {field: 'name', title: '人脸库名', align: 'center', width: '15%'},
                    {
                        field: 'type', title: '人脸库类型', align: 'center', width: '15%',
                        formatter: function (value) {
                            if (value === 1) {
                                return "上访人员"
                            } else if (value === 2) {
                                return "全国在逃人员"
                            } else if (value === 3) {
                                return "临时布控人员"
                            } else if (value === 4) {
                                return "政治敏感人员"
                            }
                        }
                    },
                    {field: 'similarityThreshold', title: '相似度阈值', align: 'center', width: '10%'},
                    {field: 'description', title: '描述', align: 'center', width: '25%'},
                    {
                        field: 'isEnabled', title: '操作', align: 'center', width: '10%',
                        formatter: function (value) {
                            if (value) {
                                return "<a href='javascript: (new mast.FaceDatabase()).enable(false);'  >取消开启</a>";
                            } else {
                                return "<a href='javascript: (new mast.FaceDatabase()).enable(true);'  >开启</a>";
                            }
                        }
                    },
                    {
                        field: 'op', title: '查看名单详情', align: 'center', width: '15%',
                        formatter: function () {
                            return "<a href='javascript: (new mast.FaceDatabase()).showPeopleList();'  >查看名单列表</a>"
                        }
                    }
                ]],
                toolbar: "#toolbar"
            });

            //初始化疑似人员列表
            faceDatabase.personGrid.datagrid({
                idField: 'id',
                fitColumns: true,
                fit: true,
                striped: true,
                pagination: true,
                singleSelect: true,
                loadFilter: function (data) {
                    $.each(data.rows, function (index, node) {

                    });
                    return data;
                },
                columns: [[
                    {
                        field: 'monitorPeopleImagesList', title: '图片', align: 'center', width: '15%',
                        formatter: function (val) {
                            var val = val && val.length ? val[0] : {
                                        imageFolder: 'static/images',
                                        imageName: 'image-bg.png'
                                    },
                                src = mast.basePath + "/" + val.imageFolder + "/" + val.imageName;
                            return '<a href="' + src + '" class="fancybox" >' + '<img src="' + src + '" ' +
                                'style="max-height: 110px;max-width: 110px;" >' + '</a>';
                        }
                    },
                    {field: 'name', title: '姓名', align: 'center', width: '10%'},
                    {field: 'gender', title: '性别', align: 'center', width: '10%'},
                    {field: 'idCard', title: '身份证', align: 'center', width: '20%'},
                    {field: 'birthday', title: '生日', align: 'center', width: '10%'},
                    {field: 'description', title: '备注', align: 'center', width: '25%'},
                    {
                        field: 'op', title: '操作', align: 'center', width: '10%',
                        formatter: function (val, row) {
                            return '<a href="javascript:mast.faceDatabase.deletePerson();" >删除</a> ';
                        }
                    },
                    {field: 'id', hidden: true}
                ]],
                toolbar: [
                    {
                        iconCls: 'icon-add',
                        text: '添加人员',
                        handler: function () {
                            faceDatabase.addPerson();
                        }
                    }
                ]
            });
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
    });
}();