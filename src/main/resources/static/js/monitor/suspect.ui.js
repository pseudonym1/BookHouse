/**
 * 添加人员 UI
 */
!function () {
    var suspect = new mast.Suspect();
    var uploader; //图片上传对象
    var fileCount = 0, success = 0, fail = 0; // 添加的文件数量

    var UIObj = {
        eventInit: function () {
        },
        init: function () {
            var path = window.parent.mast.mainFrame.getTabPath(window.name);
            suspect.north.panel('setTitle', path.join('/'));
            //初始化人脸库下拉列表
            suspect.faceDatabaseId.combobox({
                url: mast.Suspect.URL_LOAD_FACEDATABASE_LIST,
                valueField: 'id',
                textField: 'name'/*,
                 mode:'remote',
                 editable:false*/
            });

            suspect.mainFormBtns.find("a").click(function () {
                var $this = $(this),
                    btnText = $this.text().trim();

                if (btnText == mast.constant.SAVE) {
                    if (fileCount < 1) {
                        $.messager.alert({
                            title: '警告',
                            icon: 'warning',
                            msg: "请选择需要上传图片！"
                        });
                        return 0;
                    }
                    //设置成disable
                    $this.linkbutton("disable");
                    //保存方法，同时触发上传
                    suspect.save(uploader);
                } else if (btnText == mast.constant.RESET) {
                    $("#saveBtn").linkbutton("enable");
                    var files = uploader.getFiles();
                    $.each(files, function (i, file) {
                        removeFile(file);
                    });
                    setState('pedding');//恢复UI
                    uploader.reset();//重置队列
                    suspect.mainForm.form("clear");//清空表单
                }
            });

            //图片上传
            uploader = WebUploader.create({

                pick: {
                    id: '#filePicker',
                    innerHTML: '点击选择图片'
                },
                // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
                disableGlobalDnd: true,

                accept: {
                    title: 'Images',
                    extensions: 'jpg,jpeg,bmp,png',
                    mimeTypes: 'image/jpg,image/jpeg,image/bmp,image/png'
                },

                // 选完文件后，是否自动上传。
                auto: false,
                // swf文件路径
                swf: mast.Suspect.URL_SWF,

                // 文件接收服务端。
                server: mast.Suspect.URL_UPLOADER_SERVICE,

                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                resize: false,
                fileNumLimit: 8,
                fileSizeLimit: 8 * 1024 * 1024,    // 8M
                fileSingleSizeLimit: 1 * 1024 * 1024    // 1M
            });
            var $wrap = $('#uploader'),
                // 图片容器
                $queue = $('<ul class="filelist"></ul>')
                    .appendTo($wrap.find('.queueList')),
                // 状态栏，包括进度和控制按钮
                $statusBar = $wrap.find('.statusBar'),
                // 文件总体选择信息。
                $info = $statusBar.find('.info'),
                // 上传按钮
                //$upload = $wrap.find('.uploadBtn'),
                // 没选择文件之前的内容。
                $placeHolder = $wrap.find('.placeholder'),
                // 总体进度条
                $progress = $statusBar.find('.progress').hide(),

                // 添加的文件总大小
                fileSize = 0,
                // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,
                // 缩略图大小
                thumbnailWidth = 110 * ratio,
                thumbnailHeight = 110 * ratio,
                // 可能有pedding, ready, uploading, confirm, done.
                state = 'pedding',
                // 所有文件的进度信息，key为file id
                percentages = {},
                supportTransition = (function () {
                    var s = document.createElement('p').style,
                        r = 'transition' in s ||
                            'WebkitTransition' in s ||
                            'MozTransition' in s ||
                            'msTransition' in s ||
                            'OTransition' in s;
                    s = null;
                    return r;
                })();
            uploader.addButton({
                id: '#filePicker2',
                label: '继续添加'
            });

            //重置
            uploader.on('reset', function () {
                fileCount = 0;
                fileSize = 0;
                success = 0;
                fail = 0;
            });
            //加入文件队列
            uploader.on('fileQueued', function (file) {
                fileCount++;
                fileSize += file.size;

                if (fileCount === 1) {
                    $placeHolder.addClass('element-invisible');
                    $statusBar.show();
                }

                addFile(file);
                setState('ready');
                updateTotalProgress();
            });
            //移出文件队列
            uploader.on('fileDequeued', function (file) {
                fileCount--;
                fileSize -= file.size;

                if (!fileCount) {
                    setState('pedding');
                }

                removeFile(file);
                updateTotalProgress();
            });

            //上传开始
            uploader.on('startUpload', function () {
                setState('uploading');
            });

            //上传过程中触发，携带上传进度
            uploader.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');

                $percent.css('width', percentage * 100 + '%');
                percentages[file.id][1] = percentage;
                updateTotalProgress();
            });

            //当文件上传成功时触发
            uploader.on('uploadSuccess', function (file, response) {
                if (response.success) {
                    //$.messager.show({
                    //    title: '成功',
                    //    msg: "添加人员成功！",
                    //    iconCls: 'icon-ok'
                    //});
                } else {
                    file.setStatus("error", response.msg);
                    $('#' + file.id).children('span.success').remove();
                }
            });
            //当文件上传出错时触发
            uploader.on('uploadError', function (file, reason) {
                $('#' + file.id).find('p.error').text('未知错误');
            });

            //所有文件上传完成触发
            uploader.on('uploadFinished', function (file) {
                //$( '#'+file.id ).find('.progress').remove();
                setState("finish");
                if (success > 0) {
                    $.messager.show({
                        title: '提示',
                        msg: "成功添加布控人！",
                        iconCls: 'icon-ok'
                    });
                }
            });

            // 当有文件添加进来时执行，负责view的创建
            function addFile(file) {
                var $li = $('<li id="' + file.id + '">' +
                        '<p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap"></p>' +
                        '<p class="progress"><span></span></p>' +
                        '</li>'),

                    $btns = $('<div class="file-panel">' +
                        '<span class="cancel">删除</span>' +
                        '<span class="rotateRight">向右旋转</span>' +
                        '<span class="rotateLeft">向左旋转</span></div>').appendTo($li),
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find('p.imgWrap'),
                    $info = $('<p class="error"></p>'),

                    showError = function (text) {
                        $info.text(text).appendTo($li);
                    };

                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                } else {
                    // @todo lazyload
                    $wrap.text('预览中');
                    uploader.makeThumb(file, function (error, src) {
                        if (error) {
                            $wrap.text('不能预览');
                            return;
                        }

                        var img = $('<img src="' + src + '">');
                        $wrap.empty().append(img);
                    }, thumbnailWidth, thumbnailHeight);

                    percentages[file.id] = [file.size, 0];
                    file.rotation = 0;
                }

                /*
                 inited 初始状态
                 queued 已经进入队列, 等待上传
                 progress 上传中
                 complete 上传完成。
                 error 上传出错，可重试
                 interrupt 上传中断，可续传。
                 invalid 文件不合格，不能重试上传。会自动从队列中移除。
                 cancelled 文件被移除。
                 */
                file.on('statuschange', function (cur, prev) {
                    if (prev === 'progress') {
                        $prgress.hide().width(0);
                    } else if (prev === 'queued') {
                        $li.off('mouseenter mouseleave');
                        $btns.remove();
                    }

                    // 成功
                    if (cur === 'error' || cur === 'invalid') {
                        showError(file.statusText);
                        percentages[file.id][1] = 1;
                    } else if (cur === 'queued') {
                        percentages[file.id][1] = 0;
                    } else if (cur === 'progress') {
                        $info.remove();
                        $prgress.css('display', 'block');
                    } else if (cur === 'complete') {
                        $li.append('<span class="success"></span>');
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });

                $li.on('mouseenter', function () {
                    $btns.stop().animate({height: 30});
                });

                $li.on('mouseleave', function () {
                    $btns.stop().animate({height: 0});
                });

                $btns.on('click', 'span', function () {
                    var index = $(this).index(),
                        deg;

                    switch (index) {
                        case 0:
                            uploader.removeFile(file);
                            return;

                        case 1:
                            file.rotation += 90;
                            break;

                        case 2:
                            file.rotation -= 90;
                            break;
                    }

                    if (supportTransition) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                    }
                });

                $li.appendTo($queue);
            }

            // 负责view的销毁
            function removeFile(file) {
                var $li = $('#' + file.id);

                delete percentages[file.id];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each(percentages, function (k, v) {
                    total += v[0];
                    loaded += v[0] * v[1];
                });

                percent = total ? loaded / total : 0;

                spans.eq(0).text(Math.round(percent * 100) + '%');
                spans.eq(1).css('width', Math.round(percent * 100) + '%');
                updateStatus();
            }

            function updateStatus() {
                var text = '', stats;

                if (state === 'ready') {
                    text = '选中' + fileCount + '张图片，共' +
                        WebUploader.formatSize(fileSize) + '。';
                } else if (state === 'finish') {
                    stats = uploader.getStats();
                    fail = stats.uploadFailNum ? stats.uploadFailNum : 0;
                    success = fileCount - fail;
                    text = '共' + fileCount + '张（' +
                        WebUploader.formatSize(fileSize) +
                        '），成功' + success + '张';

                    if (fail) {
                        text += '，失败' + fail + '张';
                    }
                }

                $info.html(text);
            }

            function setState(val) {
                if (val === state) {
                    return;
                }
                state = val;

                switch (state) {
                    case 'pedding':
                        $placeHolder.removeClass('element-invisible');
                        $queue.parent().removeClass('filled');
                        $queue.hide();
                        $statusBar.addClass('element-invisible');
                        uploader.refresh();
                        break;

                    case 'ready':
                        $placeHolder.addClass('element-invisible');
                        $('#filePicker2').removeClass('element-invisible');
                        $queue.parent().addClass('filled');
                        $queue.show();
                        $statusBar.removeClass('element-invisible');
                        uploader.refresh();
                        break;

                    case 'uploading':
                        $('#filePicker2').addClass('element-invisible');
                        $progress.show();
                        break;

                    case 'finish':
                        $progress.hide();
                        uploader.refresh();
                        break;
                }

                updateStatus();
            }
        },
        extraInit: function () {
            if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.faceId) {
                suspect.faceDatabaseId.combobox('setValue', parent.mast.MainFrame.params.faceId)
                    .combobox('readonly', true);
            } else if (parent.mast.MainFrame.params && parent.mast.MainFrame.params.person) {
                var row = parent.mast.MainFrame.params.person;
                suspect.mainForm.form('load', row);
                suspect.faceDatabaseId.combobox('readonly', true);

            }
        }
    };

    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
        UIObj.extraInit();
    });
}();
