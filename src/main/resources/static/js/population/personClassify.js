/**
 * 人员管理
 */
!function () {

    var Classify = my.Class({
        //继承公共常量
        STATIC: $.extend({}, mast.STATIC, {
            TODAY_APPEAR: "今日出现",
            TODAY_ADD: "今日新增",
            SAVE_ADJUST: "保存调整",
            MOVE_GOALS: "移动照片到",
            DELETE_PHOTO: "删除照片",
            MARK: "标注人员信息",
            ADJUST_NEW_CLASSIFY: "调整到新分类",
            //主列表
            URL_LOAD_GRID: mast.basePath + "/pm/people/loadGrid.json",
            URL_CLASSIFY_QUERY: mast.basePath + "/pm/people/loadGridForQuery.json",
            URL_LOAD_GRID_Workbench: mast.basePath + "/pm/people/loadGridForWorkbench.json",
            URL_QUERY_Workbench: mast.basePath + "/pm/people/queryForWorkbench.json",
            //人员标注
            URL_UPDATE: mast.basePath + "/pm/people/mark.json",
            //分类调整
            URL_PERSONAL_PHOTO_LIST: mast.basePath + "/pm/people/loadPhotoGallery.json",
            URL_LOAD_MOVEGOALS: mast.basePath + "/pm/people/loadMoveGoals.json",
            URL_ADJUST_CLASSIFY: mast.basePath + "/pm/people/adjustClassify.json",
            URL_ADJUST_NEW_CLASSIFY: mast.basePath + "/pm/people/adjustToNewClassify.json",
            URL_GET_RECENT_CLASSIFY: mast.basePath + "/pm/people/getRecentClassify.json",
            URL_DELETE_CLASSIFY_PICTURE: mast.basePath + "/pm/people/deleteFiles.json",
            //楼宇列表
            URL_LOAD_BUILDING_LIST: mast.basePath + "/sys/building/loadList.json",
            URL_SEARCH: mast.basePath + "/sys/building/search.json"
        }),

        constructor: function () {
            this.mainLayout = $("#mainLayout");
            this.queryForm = $("#toolbar");
            this.mainGrid = $("#personGrid");
            this.filterDate = $("#filterDate");
            //分类调整
            this.photoGalleryDlg = $("#photoGallery");
            this.photoGalleryGrid = $("#photoGalleryGrid");
            this.photoGalleryToolbar = $("#photoGalleryToolbar");
            this.selectTotal = $("#selectTotal").find("em");
            this.photoMoveGridDlg = $("#photoMoveDialog");
            this.photoMoveGrid = $("#photoMoveGrid");
            this.photoMoveToolbar = $("#photoMoveToolbar");
            //标注人员信息
            this.mainDialog = $("#mainDialog");
            this.mainForm = $("#mainForm");
            this.mainFormBtns = $("#mainForm-buttons");
            //楼宇列表
            this.dataList = $("#dataList");
            this.searchBtn = $("#searchBtn");
            this.buildingList = $("#buildingList");
        },
        /**
         * 楼宇搜索
         */
        search: function (key) {
            this.dataList.datagrid("options").url = Classify.URL_SEARCH;
            this.dataList.datagrid("load", {
                name: key
            })
        },
        /**
         * 人员标注 查询
         */
        query: function () {
            var self = this;
            var obj = mast.utils.serializeObject(this.queryForm.serializeArray());
            if (obj['like-value']) {
                obj[obj['like-key']] = obj['like-value'];
            }
            if (this.isNotWorkbenchEnter()) {
                self.mainGrid.datacard('options').url = mast.Classify.URL_CLASSIFY_QUERY;
                var buildingId = this.checkHasBuildingId();
                if (!buildingId) return;
                obj.buildingId = buildingId;
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    self.mainGrid.datacard('options').url = mast.Classify.URL_QUERY_Workbench;
                    var title = parent.mast.mainFrame.contentTabs.tabs('getSelected').panel('options').title;
                    if (title == Classify.TODAY_APPEAR) {
                        obj.status = 2;
                    } else if (title == Classify.TODAY_ADD) {
                        obj.status = 1;
                    }
                    obj.buildingId = parent.mast.MainFrame.params.buildingId;
                }
            }
            self.mainGrid.datacard('load', obj);
        },
        /**
         * 调整窗口 查询分类
         */
        adjustQueryClassify: function () {
            var self = this;
            var obj = mast.utils.serializeObject(self.photoMoveToolbar.serializeArray());
            var row = self.mainGrid.datacard("getSelected");
            if(row && row.id) {
                obj.id = row.id
            }
            if (this.isNotWorkbenchEnter()) {
                self.mainGrid.datacard('options').url = mast.Classify.URL_LOAD_MOVEGOALS;
                var buildingId = this.checkHasBuildingId();
                if (!buildingId) return;
                obj.buildingId = buildingId;
            } else {
                if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.buildingId) {
                    obj.buildingId = parent.mast.MainFrame.params.buildingId;
                }
            }
            self.photoMoveGrid.datacard('load', obj);
        },
        /**
         * 保存标注人员信息
         */
        save: function () {
            var self = this;
            var row = self.mainGrid.datacard('getSelected');
            self.mainForm.form("submit", {
                url: Classify.URL_UPDATE,
                onSubmit: function () {
                    return self.mainForm.form('validate');
                },
                success: function (data) {
                    mast.utils.complete(data);
                    mast.utils.close([
                        self.mainDialog,
                        self.photoMoveGridDlg
                    ]);
                    self.mainDialog.dialog('setTitle', row.sysClassifyName + '(' + data.name + ')' + '的照片库');
                    self.mainGrid.datacard('reload');
                }
            })
        },

        /**
         * 删除分类中照片
         */
        deleteFiles: function () {
            var self = this;
            $.messager.confirm('提示', '确定要删除所选照片?', function (r) {
                if (r) {
                    var row = self.mainGrid.datacard('getSelected');
                    var rows = self.photoGalleryGrid.datacard('getSelections');
                    var fileNames = [], imageName;
                    $.each(rows, function (index, node) {
                        imageName = node.imageName;
                        imageName = imageName.replace(/\\/g, ',').replace('/', ',');
                        var names = imageName.split(',');
                        fileNames.push(names && names[names.length - 1]);
                    });
                    $.ajax({
                        url: Classify.URL_DELETE_CLASSIFY_PICTURE,
                        type: 'post',
                        data: {
                            classifyId: row.id,
                            url: row.imageIp,
                            srcFolder: row.imageFolder,
                            srcFiles: fileNames.join(",")
                        },
                        success: function (result) {
                            self.complete(result);
                            //重新加载 图片库
                            self.photoGalleryGrid.datacard('reload');
                            //重置选择器
                            self.selectTotal.text(0);
                        }
                    });
                }
            });
        },

        /**
         * 调整照片到目标分类
         */
        adjust: function () {
            var self = this;
            var srcRow = self.mainGrid.datacard('getSelected');
            var photos = self.photoGalleryGrid.datacard('getSelections');
            var destRow = self.photoMoveGrid.datacard('getSelected');
            $.messager.confirm('提示', ('确定要调整这些照片到<span style="color:red;">' + destRow.sysClassifyName + '</span>?'), function (r) {
                if (r) {
                    var fileNames = [], imageName;
                    $.each(photos, function (index, node) {
                        imageName = node.imageName;
                        imageName = imageName.replace(/\\/g, ',').replace('/', ',');
                        var names = imageName.split(',');
                        fileNames.push(names && names[names.length - 1]);
                    });
                    $.ajax({
                        url: Classify.URL_ADJUST_CLASSIFY,
                        type: 'post',
                        data: {
                            url: srcRow.imageIp,
                            buildingId: srcRow.buildingId,
                            //源分类
                            classifyId: srcRow.id,
                            srcFolder: srcRow.imageFolder,
                            srcSysClassifyName: srcRow.sysClassifyName,
                            srcFiles: fileNames.join(","),
                            //目标分类
                            destFolder: destRow.imageFolder,
                            destSysClassifyName: destRow.sysClassifyName
                        },
                        success: function (result) {
                            self.complete(result);
                            //重新加载 图片库
                            self.photoGalleryGrid.datacard('reload');
                            //重置选择器
                            self.selectTotal.text(0);
                            self.photoMoveGridDlg.dialog('close');
                        }
                    });
                }
            });
        },

        /**
         * 调整照片到新的分类
         */
        adjustToNewClassify: function () {
            var self = this;
            var srcRow = self.mainGrid.datacard('getSelected');
            var photos = self.photoGalleryGrid.datacard('getSelections');
            $.messager.confirm('提示', '确定要调整这些照片到新的分类?', function (r) {
                if (r) {
                    var fileNames = [], imageName;
                    $.each(photos, function (index, node) {
                        imageName = node.imageName;
                        imageName = imageName.replace(/\\/g, ',').replace('/', ',');
                        var names = imageName.split(',');
                        fileNames.push(names && names[names.length - 1]);
                    });
                    $.ajax({
                        url: Classify.URL_ADJUST_NEW_CLASSIFY,
                        type: 'post',
                        data: {
                            url: srcRow.imageIp,
                            buildingId: srcRow.buildingId,
                            //源分类
                            classifyId: srcRow.id,
                            srcFolder: srcRow.imageFolder,
                            srcSysClassifyName: srcRow.sysClassifyName,
                            srcFiles: fileNames.join(",")
                        },
                        success: function (result) {
                            self.complete(result);
                            //重新加载 图片库
                            self.photoGalleryGrid.datacard('reload');
                            //重置选择器
                            self.selectTotal.text(0);
                            self.photoMoveGridDlg.dialog('close');
                        }
                    });
                }
            });
        },

        /**
         * 人员标注弹窗
         */
        showUpdateWin: function () {
            var row = this.mainGrid.datacard("getSelected");
            this.clear();
            this.mainForm.form("load", {
                id: row.personId,
                classifyId: row.id,
                name: row.personName,
                idCard: row.personIdCard,
                gender: row.gender
            });
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: Classify.MARK,
                iconCls: "icon-edit",
                draggable: false
            });
        },

        /**
         * 显示图库弹窗
         */
        showPhotoGalleryWin: function () {
            var row = this.mainGrid.datacard('getSelected');
            mast.utils.showWindow({
                dd: this.photoGalleryDlg,
                title: row.sysClassifyName + (row.personName && '(' + row.personName + ')') + '的照片库',
                iconCls: "icon-man",
                draggable: false
            });
            mast.classify.imageIp = row.imageIp;
            //提供全局计数器
            mast.classify.totalNumber = 0;
            this.photoGalleryGrid.datacard('options').url = Classify.URL_PERSONAL_PHOTO_LIST;
            this.photoGalleryGrid.datacard('options').pageNumber = 1;
            this.photoGalleryGrid.datacard('load', row);
        },

        /**
         * 显示移动目标列表
         */
        showMoveWin: function () {
            var row = this.mainGrid.datacard('getSelected');
            var photos = this.photoGalleryGrid.datacard('getSelections');
            mast.utils.showWindow({
                dd: this.photoMoveGridDlg,
                title: '调整(<span style="color: #b52b27">' + row.sysClassifyName + '的&nbsp;' + '<em>' + photos.length + '</em>'
                + '&nbsp;张照片</span>)到：',
                iconCls: "icon-man",
                draggable: false
            });
            var obj = {
                id: row.id,
                buildingId: row.buildingId
            };
            this.photoMoveGrid.datacard('options').url = Classify.URL_LOAD_MOVEGOALS;
            //重置分页页码
            this.photoMoveGrid.datacard('options').pageNumber = 1;
            this.photoMoveGrid.datacard('load', obj);
        },

        closePhotoGalleryWin: function () {
            var self = this;
            $.messager.show({
                title: "提示！",
                timeout: 3000,
                msg: "该人员已没有照片了，2秒后将自动关闭窗口。"
            });
            setTimeout(function () {
                self.photoGalleryDlg.dialog("close");
            }, 2000);
        },

        /**
         * 检查是否有选中楼宇
         */
        checkHasBuildingId: function () {
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
        },

        clear: function () {
            this.mainForm.form("clear");
        },

        close: function () {
            this.mainDialog.dialog("close");
        },
        complete: function (data) {
            mast.utils.complete(data);
        },
        hasSelected: function (type) {
            var msg1, rows, row1, row2;
            if (type === Classify.MOVE_GOALS || type === Classify.DELETE_PHOTO) {
                rows = this.photoGalleryGrid.datacard("getSelections");
                msg1 = "请选择一些照片，再进行移动照片操作。";
                return mast.utils.hasSomeSelected(rows, msg1);
            } else if (type === Classify.SAVE_ADJUST) {
                row1 = this.photoMoveGrid.datacard("getSelections");
                msg1 = "请选择一个目标分类，再进行保存调整操作。";
                return mast.utils.hasOneSelected(row1, msg1);
            } else if (type === Classify.MARK) {
                row2 = this.mainGrid.datacard("getSelections");
                msg1 = "请选择一个目标分类，再进行保存移动操作。";
                return mast.utils.hasOneSelected(row2, msg1);
            }
            return false;
        }
    });

    mast.Classify = Classify;
}();