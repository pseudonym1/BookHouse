/**
 * 校验扩展
 */
!function () {
    $.extend($.fn.validatebox.defaults.rules, {
        chs: {
            validator: function (value) {
                return /^[\u0391-\uFFE5]+$/.test(value);
            },
            message: '请输入中文'
        },
        password: {
            validator: function (value) {
                return /^\d|\w$/.test(value);
            },
            message: '请输入数字、字母和_等字符'
        },
        postal: {
            validator: function (value) {
                return /^[1-9]\d{5}$/.test(value);
            },
            message: '邮政编码不存在'
        },
        qq: {
            validator: function (value) {
                return /^[1-9]\d{4,11}$/.test(value);
            },
            message: 'QQ号码不正确'
        },
        mobile: {
            validator: function (value) {
                return /^[1]\d{10}$/.test(value);
            },
            message: '手机号码不正确'
        },
        telephone: {
            validator: function (value) {
                return /^(0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(\/-[0-9]{1,4})?$/.test(value);
            },
            message: '座机号码不正确'
        },
        equal: {
            validator: function (value, param) {
                return value == $(param[0]).val();
            },
            message: '两次输入的值不一致'
        },
        less: {
            validator: function (value, param) {
                return value < $(param[0]).val();
            },
            message: '请输入更小的值'
        },
        greater: {
            validator: function (value, param) {
                return value > $(param[0]).val();
            },
            message: '请输入更大的值'
        },
        ip: {},
        idCard: {
            validator: function (value) {
                return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
            },
            message: '请输入正确的身份证号码'
        },
        verifyCode: {
            validator: function (value, param) {
                if (!mast.vcode) {
                    $.ajax({
                        url: mast.basePath + "/showcase/checkCode",
                        type: 'POST',
                        data: {keyName: param[0]},
                        dataType: 'json',
                        success: function (data) {
                            if (data.success) {
                                mast.vcode = data.msg;
                            }
                        }
                    })
                }

                return value.toLocaleUpperCase() == (mast.vcode == null ? "" : mast.vcode.toLocaleUpperCase());
            },
            message: '验证码错误'
        },
        /**
         * 重名校验
         * @param url
         */
        duplication: {
            validator: function (value, param) {
                if (mast.tempStr != value) {
                    $.ajax({
                        url: mast.basePath + param[0],
                        type: 'POST',
                        data: {keyName: value},
                        dataType: 'json',
                        success: function (data) {
                            mast.tempStr = value;
                            mast.duplication = data.success;
                        }
                    })
                }
                return !mast.duplication;
            },
            message: '已存在！'
        }
    });
}();