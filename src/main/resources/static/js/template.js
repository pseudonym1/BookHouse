/**
 * 模板对象 oop
 * 空模板，具体实现可查看sample.js(包含CRUD功能)
 * *************************************
 */
!function () {
    var Template = my.Class({
        STATIC: {
            //常量，URL，title信息
        },
        /**
         * 构造方法，提供自定义成员变量
         */
        constructor: function () {
            //注意：#id 请对应你自己页面的id
        }
        // 添加自定义方法如：save, delete, update, query
    });

    //必须接入全局对象 mast
    mast.Template = Template;
}();