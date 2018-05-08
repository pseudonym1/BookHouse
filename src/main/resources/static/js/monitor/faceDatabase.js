/**
 * 人脸库
 */
!function () {
    var FaceDatabase = my.Class({
        STATIC: $.extend({}, mast.STATIC, {
            ADD_PEOPLE: '添加人员',
            URL_LINK_ADD_PEOPLE: mast.basePath + "/monitor/suspect/main",
            URL_LOAD_GRID: mast.basePath + "/monitor/facedatabase/loadGrid.json",
            URL_ADD: mast.basePath + "/monitor/facedatabase/add.json",
            URL_UPDATE: mast.basePath + "/monitor/facedatabase/update.json",
            URL_DELETE: mast.basePath + "/monitor/facedatabase/delete.json",
            URL_OPEN: mast.basePath + "/monitor/facedatabase/open.json",
            URL_ENABLE: mast.basePath + "/monitor/facedatabase/enable.json",
            URL_LOAD_PERSON_GRID: mast.basePath + "/monitor/facedatabase/loadPersonGrid.json",
            URL_LOAD_PEOPLE_IMAGES: mast.basePath + "/monitor/facedatabase/loadPersonImages.json",
            URL_DELETE_PERSON: mast.basePath + '/monitor/facedatabase/delete/person.json'
        }),
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.mainGrid = $("#mainGrid");
            this.mainDialog = $("#mainDialog");
            this.mainForm = $("#mainForm");
            this.mainFormBtns = $("#mainFromButtons");
            this.personGrid = $("#personGrid");
            this.personListDialog = $("#personListDialog");
            this.personImagesDialog = $("#personImagesDialog");
            this.toolbarBtns = $("#toolbar");

            //个人图片集
            this.personImagesList = $("#personImagesList");

            //注入父页面mainFrame对象
            this.mainFrame = new parent.mast.MainFrame();
        },
        /**
         * 跳转添加人员页面
         */
        jumpToPage: function () {
            var entry = mast.FaceDatabase.URL_LINK_ADD_PEOPLE,
                text = mast.FaceDatabase.ADD_PEOPLE;

            var isExists = this.mainFrame.contentTabs.tabs('exists', text);
            if (isExists) {
                this.mainFrame.contentTabs.tabs('select', text);
                this.mainFrame.refreshTab({title: text, url: entry});
            } else {
                this.mainFrame.createContentTab({
                    text: text,
                    entry: entry
                });
            }
        },
        cancel: function () {
            mast.utils.clear([
                this.mainForm,
                this.queryForm
            ]);
            mast.utils.close([
                this.mainDialog,
                this.queryDialog
            ]);
        },
        open: function (type) {
            var self = this;
            $.messager.confirm('提示', '确定要操作这条记录?', function (r) {
                if (r) {
                    var row = self.mainGrid.datagrid('getSelected');
                    $.ajax({
                        url: FaceDatabase.URL_OPEN,
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
        enable: function (type) {
            var self = this;
            $.messager.confirm('提示', '确定要操作这条记录?', function (r) {
                if (r) {
                    var row = self.mainGrid.datagrid('getSelected');
                    $.ajax({
                        url: FaceDatabase.URL_ENABLE,
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
        save: function (type) {
            var self = this;
            if (type === FaceDatabase.ADD) {
                self.mainForm.form('submit', {
                    url: FaceDatabase.URL_ADD,
                    success: function (data) {
                        self.complete(data);
                    }
                });
            } else if (type === FaceDatabase.UPDATE) {
                self.mainForm.form('submit', {
                    url: FaceDatabase.URL_UPDATE,
                    onSubmit: function () {
                        return true;
                    },
                    success: function (data) {
                        self.complete(data);
                    }
                });
            }
        },
        delete: function () {
            var self = this;
            $.messager.confirm('提示', '确定要删除这些记录?', function (r) {
                if (r) {
                    var rows = self.mainGrid.datagrid('getSelections');
                    var ids = [];
                    $.each(rows, function (index, item) {
                        ids.push(item.id);
                    });
                    $.ajax({
                        url: FaceDatabase.URL_DELETE,
                        type: 'POST',
                        contentType: "application/json",
                        data: JSON.stringify(ids),
                        dataType: 'json',
                        success: function (data) {
                            self.complete(data);
                        }
                    });
                }
            });
        },
        deletePerson: function (id) {
            var self = this;
            $.ajax({
                url: FaceDatabase.URL_DELETE_PERSON,
                type: 'POST',
                data: {id: id},
                dataType: 'json',
                success: function (data) {
                    if (data) {
                        mast.utils.complete({success: true, msg: '成功删除布控人'});
                        mast.utils.reload(self.personGrid);
                    }
                }
            });
        },
        editPerson: function () {
            var row = this.personGrid.datagrid('getSelected');
            parent.mast.MainFrame.params = {};
            parent.mast.MainFrame.params.person = row;
            this.jumpToPage();
        },
        addPerson: function () {
            var row = this.mainGrid.datagrid('getSelected');
            parent.mast.MainFrame.params = {};
            parent.mast.MainFrame.params.faceId = row.id;
            this.jumpToPage();
        },
        showAddWin: function () {
            this.clear();
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: FaceDatabase.ADD,
                iconCls: 'icon-add'
            });
        },
        showUpdateWin: function (row) {
            this.clear();
            row = row || this.mainGrid.datagrid("getSelected");
            this.mainForm.form("load", row);
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: FaceDatabase.UPDATE,
                iconCls: 'icon-edit'
            });
        },
        showPeopleList: function () {
            var row = this.mainGrid.datagrid("getSelected"),
                path = window.parent.mast.mainFrame.getTabPath(window.name);
            path.push(row.name);
            mast.utils.showWindow({
                dd: this.personListDialog,
                title: path.join('/'),
                iconCls: 'icon-man'
            });
            this.personGrid.datagrid('options').url = FaceDatabase.URL_LOAD_PERSON_GRID;
            this.personGrid.datagrid('load', {
                faceDatabaseId: row.id
            });
        },
        showPeopleImages: function () {
            var self = this;
            var row = self.personGrid.datagrid("getSelected");
            $.ajax({
                url: FaceDatabase.URL_LOAD_PEOPLE_IMAGES,
                type: 'POST',
                data: {id: row.id},
                dataType: 'json',
                success: function (data) {
                    mast.utils.showWindow({
                        dd: self.personImagesDialog,
                        title: "人员照片集（" + row.name + "）"
                    });
                    self.personImagesList.html(" ");
                    if (data.length) {
                        var src;
                        $.each(data, function (index, nodeLi) {
                            src = mast.basePath + "/" + nodeLi.imageFolder + "/" + nodeLi.imageName
                            self.personImagesList.append(
                                "<li>" +
                                "<img src='" + src + "' style='max-height: 140px;max-width: 140px;'/>" +
                                "</li>"
                            )
                        });
                    } else {
                        self.personImagesList.append("<h2>没有添加图片</h2>")
                    }
                }

            })
        },
        clear: function () {
            mast.utils.clear([
                this.mainForm
            ]);
        },
        close: function () {
            mast.utils.close([
                this.mainDialog
            ])
        },
        complete: function (result) {
            mast.utils.complete(result);
            mast.utils.close([
                this.mainDialog
            ]);
            mast.utils.reload(this.mainGrid);
        },
        hasSelected: function (type) {
            var msg1, msg2, rows = this.mainGrid.datagrid("getSelections");
            if (type == FaceDatabase.UPDATE) {
                msg1 = "请选择一条人脸库记录，再进行修改操作";
                msg2 = "请只选择一条人脸库记录，再进行修改操作";
                return mast.utils.hasOneSelected(rows, msg1, msg2);
            } else if (type === FaceDatabase.DELETE) {
                msg1 = "请选择一些人脸库记录，再进行删除操作";
                return mast.utils.hasSomeSelected(rows, msg1);
            }
            return false;
        }
    });
    //必须接入全局对象 mast
    mast.FaceDatabase = FaceDatabase;
}();