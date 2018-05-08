/**
 * 模板 UI
 * 空模版，具体实现可参照sample.ui.js
 */
!function () {
    var template = new mast.Template();

    var UIObj = {
        eventInit: function () {
            //监听事件，如表单提交按钮等
        },
        init: function () {
            //easyui 编码方式，初始化组件。
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
    });
}();