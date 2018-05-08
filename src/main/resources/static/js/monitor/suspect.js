/**
 * 添加人员 oop
 */
!function () {
    var Suspect = my.Class({
        STATIC: {
            URL_SWF: mast.basePath + '/swf/Uploader.swf',
            URL_UPLOADER_SERVICE: mast.basePath + "/monitor/suspect/uploader.json",
            URL_LOAD_FACEDATABASE_LIST: mast.basePath + "/monitor/facedatabase/loadList.json",
            URL_ADD: mast.basePath + "/monitor/suspect/add.json",
            URL_DELETE: mast.basePath + "/monitor/suspect/delete.json"
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            this.north = $('#north');
            //人员基本信息
            this.mainForm = $("#mainForm");
            this.faceDatabaseId = $("#faceDatabaseId");
            this.mainFormBtns = $("#mainFormButtons");
            //已添加照片
            this.peopleImagedListPanel = $("#peopleImagedListPanel");
            this.peopleImagedList = $("#peopleImagedList");
        },
        //保存方法
        save: function (uploader) {
            if (!uploader) return 0;
            var self = this;
            //保存人员基本信息
            self.mainForm.form('submit', {
                url: Suspect.URL_ADD,
                onSubmit: function () {
                    var isValid = $(this).form('validate');
                    if (!isValid) {
                        self.mainFormBtns.find('a#saveBtn').linkbutton("enable");	// hide progress bar while the form is invalid
                    }
                    return isValid;
                },
                success: function (monitoredPeopleId) {
                    uploader.option('formData', {
                        monitoredPeopleId: monitoredPeopleId
                    });
                    uploader.upload();
                }
            });
        },
        complete: function (result) {
            mast.utils.complete(result);
        }
    });

    //必须接入全局对象 mast
    mast.Suspect = Suspect;
}();
