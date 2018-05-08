/**
 * 个人(居民)信息对象
 */
!function () {
    var PersonInfo = my.Class({
        STATIC: {
            UPDATE: "标注个人信息",
            INFO: "查看个人详情",
            URL_UPDATE: mast.basePath + "/fr/classify/savePersonInfo.json"
        },

        constructor: function () {
            this.mainDialog = $("#mainDialog");
            this.mainForm = $("#mainForm");
            this.mainFormBtns = $("#mainForm-buttons");
            //依赖的对象
            this.classify = new mast.Classify();
        },

        save: function () {
            var self = this;
            self.mainForm.form("submit", {
                url: PersonInfo.URL_UPDATE,
                onSubmit: function () {
                    return self.mainForm.form('validate');
                },
                success: function (data) {
                    self.complete(data);
                }
            })
        },

        showUpdateWin: function (row) {
            this.clear();
            this.reset(PersonInfo.UPDATE);
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: PersonInfo.UPDATE,
                iconCls: "icon-edit"
            });
            row = row || this.classify.mainGrid.datagrid("getSelected");
            var personInfo = row['personInfo'];
            this.mainForm.form("load", {
                id: personInfo ? personInfo.id : "",
                sysClassifyName: row.sysClassifyName,
                personName: row.personName,
                idCardNo: personInfo ? personInfo.idCardNo : "",
                gender: personInfo ? personInfo.gender : ""
            });
        },

        showDetailWin: function () {
            this.clear();
            this.reset(PersonInfo.INFO);
            mast.utils.showWindow({
                dd: this.mainDialog,
                title: PersonInfo.INFO,
                iconCls: "icon-detail"
            });
            var row = this.classify.mainGrid.datagrid("getSelected");
            var personInfo = row['personInfo'];
            this.mainForm.form("load", {
                id: personInfo ? personInfo.id : "",
                sysClassifyName: row.sysClassifyName,
                personName: row.personName,
                idCardNo: personInfo ? personInfo.idCardNo : "",
                gender: personInfo ? personInfo.gender : ""
            });
        },

        close: function() {
            this.mainDialog.dialog("close");
        },

        clear: function() {
            this.mainForm.form("clear");
        },

        reset: function (type) {
            if (type == PersonInfo.INFO) {
                $("#personName").textbox("disable");
                $("#idCardNo").textbox("disable");
                $.each(this.mainForm.find("select"), function (index, node) {
                    $(node).textbox("disable");
                });
                $.each(this.mainFormBtns.find("a"), function (index, node) {
                    if (index == 0) $(node).hide();
                });
            } else if(type == PersonInfo.UPDATE) {
                $("#personName").textbox("enable");
                $("#idCardNo").textbox("enable");
                $.each(this.mainForm.find("select"), function (index, node) {
                    $(node).combobox("enable");
                });
                $.each(this.mainFormBtns.find("a"), function (index, node) {
                    if (index == 0) $(node).show();
                });
            }
        },

        complete: function (data) {
            mast.utils.complete(data);
            this.classify.mainGrid.datagrid("reload");
            this.mainDialog.dialog("close");
        }
    });


    mast.PersonInfo = PersonInfo;
}();