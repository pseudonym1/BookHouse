/**
 * datacard - jQuery EasyUI
 * 数据以卡片形式展示，类天猫商品列表。
 *
 * Dependencies:
 *   panel
 *   resizable
 *   linkbutton
 *   pagination
 */
(function ($) {

    /**
     * 设置 datacard 大小
     * @param target 目标dom对象
     */
    function setSize(target) {
        var state = $.data(target, "datacard");
        var opts = state.options;
        var dc = state.dc;
        var panel = state.panel;
        var container = panel.parent();
        var width = panel.width();
        var height = panel.height();
        var view = dc.view;
        var iView = dc.iView;
        var header = container.find(".panel-header");
        var toolbar = panel.find(".datagrid-toolbar");
        var pager = panel.children("div.datagrid-pager");
        view.width(width);
        var headerInner = header.children("div.datagrid-header-inner").show();
        iView.width(headerInner.find("table").width());
        if (!opts.showHeader) {
            headerInner.hide();
        }
        iView.width(width);
        var pagerH = 0, toolbarH = 0, headerH = 0;
        if (toolbar && toolbar.height()) {
            toolbarH = toolbar.height();
        }
        if (pager && pager.height()) {
            pagerH = pager.height();
        }
        if (header && header.height()) {
            headerH = header.height();
        }

        var iViewH = height - pagerH - toolbarH - headerH + 4;

        var innerWidth = width;
        if ($.boxModel == false) {
            innerWidth = width - panel.outerWidth() + panel.width();
        }

        $('.datagrid-wrap', panel).width(innerWidth);
        $('.datagrid-view', panel).width(innerWidth);
        $('.datagrid-iView', panel).width($('.datagrid-iView ui', panel).width());
        $('.datagrid-iView .datagrid-header', panel).width($('.datagrid-iView', panel).width());
        $('.datagrid-iView .datagrid-body', panel).width($('.datagrid-iView', panel).width());
        $('.datagrid-iView .cardview', panel).width($('.datagrid-iView', panel).width() - 30);

        header.css('height', null);
        var hh;
        if ($.boxModel == true) {
            hh = Math.max(header.height());
        } else {
            hh = Math.max(header.outerHeight());
        }

        if (opts.height == 'auto') {
            iView.height(iViewH);
            view.height(iViewH);
            var bodyH = iViewH - $('.datagrid-iView .datagrid-header', panel).outerHeight(true);
            $('.datagrid-iView .datagrid-body', panel).height(bodyH);
            $('.datagrid-iView .cardview', panel).height(bodyH);
        } else {
            iView.height(
                opts.height
                - (panel.outerHeight() - panel.height())
                - hh
                - ($('.datagrid-title', panel) ? $('.datagrid-title', panel).outerHeight(true) : 0)
                - ($('.datagrid-toolbar', panel) ? $('.datagrid-toolbar', panel).outerHeight(true) : 0)
                - ($('.datagrid-pager', panel) ? $('.datagrid-pager', panel).outerHeight(true) : 0)
            );
            view.height(iView.height());
            $('.datagrid-body', panel).height(
                iView.height()
                - $('.datagrid-iView .datagrid-header', panel).outerHeight(true)
            );
        }
    }

    /**
     * 包裹 datacard
     */
    function wrapCard(target) {
        function getColumns(thead) {
            var columns = [];
            $('tr', thead).each(function () {
                var cols = [];
                $('th', this).each(function () {
                    var th = $(this);
                    var col = {
                        title: th.html(),
                        align: th.attr('align') || 'left',
                        sortable: th.attr('sortable') == 'true' || false,
                        checkbox: th.attr('checkbox') == 'true' || false
                    };
                    if (th.attr('field')) {
                        col.field = th.attr('field');
                    }
                    if (th.attr('formatter')) {
                        col.formatter = eval(th.attr('formatter'));
                    }
                    if (th.attr('rowspan')) col.rowspan = parseInt(th.attr('rowspan'));
                    if (th.attr('colspan')) col.colspan = parseInt(th.attr('colspan'));
                    if (th.attr('width')) col.width = parseInt(th.attr('width'));

                    cols.push(col);
                });
                columns.push(cols);
            });

            return columns;
        }

        var card = $(
            '<div class="datagrid-wrap">' +
            '  <div class="datagrid-view">' +
            '    <div class="datagrid-iView">' +
            '      <div class="datagrid-header">' +
            '        <div class="datagrid-header-inner">' +
            '        </div>' +
            '      </div>' +
            '      <div class="datagrid-body">' +
            '        <div class="datagrid-body-inner">' +
            '          <ul></ul>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>').insertAfter(target);
        card.panel({doSize: false, cls: "datagrid"});
        $(target).addClass("datagrid-f").hide().appendTo(card.children("div.datagrid-view"));

        //卡片列表只显示排序列
        var columns = getColumns($('thead', target));
        $('thead', target).remove();

        var view = card.children("div.datagrid-view");
        var iView = view.children("div.datagrid-iView");
        return {
            panel: card,
            columns: columns,
            dc: {
                view: view,
                iView: iView,
                header: iView.children("div.datagrid-header").children("div.datagrid-header-inner"),
                body: iView.children("div.datagrid-body").children("div.datagrid-body-inner"),
                footer: iView.children("div.datagrid-footer").children("div.datagrid-footer-inner")
            }
        };
    }

    /**
     * 获取所有列对象
     */
    function getColumns(target) {
        var columns = [];
        //TODO: 支持表头获取列
        columns = $.data(target, 'datacard').options.columns;
        return columns;
    }

    /**
     * 获取字段
     */
    function getColumnFields(columns) {
        if (columns.length == 0) return [];

        var fields = [];
        for (var i = 0; i < columns[0].length; i++) {
            var col = columns[0][i];
            if (col.field) {
                fields.push(col.field);
            }
        }

        return fields;
    }

    /**
     * 获取列的配置选项
     */
    function getColumnOption(columns, field) {
        if (columns.length == 0) return [];
        var result = {};
        for (var i = 0; i < columns[0].length; i++) {
            var col = columns[0][i];
            if (col.field == field) {
                result = col;
                break;
            }
        }
        return result;
    }

    /**
     * 创建排序列
     */
    function createColumnHeader(columns) {
        var t = $('<table class="datagrid-htable" border="0" cellspacing="0" cellpadding="0"><tbody></tbody></table>');
        var tr = $('<tr class="datagrid-header-row"></tr>').appendTo($('tbody', t));
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            var style = "center";
            var th = $('<td align="' + style + '"></td>').appendTo(tr);
            if (col.checkbox) {
                th.attr('field', col.field);
                $('<div class="datagrid-header-check"></div>')
                    .html('<input type="checkbox"/>')
                    .appendTo(th);
            } else if (col.field) {
                th.append('<div class="datagrid-cell datagrid-sort"><span></span><span class="datagrid-sort-icon"></span></div>');
                th.attr('field', col.field);
                $('.datagrid-cell', th).width(col.width);
                $('span', th).html(col.title);
                $('span.datagrid-sort-icon', th).html('&nbsp;');
            }
        }
        return t;
    }

    function setProperties(target) {
        var opts = $.data(target, 'datacard').options;
        var panel = $.data(target, 'datacard').panel;

        //初始化包裹 datacard 的panel
        panel.panel($.extend({}, opts, {
            onResize: function (width, height) {
                if ($.data(target, 'datacard')) {
                    setSize(target);
                    fixCardSize(target, false);
                    opts.onResize.call(panel, width, height);
                }
            },
            onExpand: function () {
                if ($.data(target, 'datacard')) {
                    opts.onExpand.call(panel);
                }
            }
        }));

        //加载工具栏
        if (opts.toolbar) {
            if ($.isArray(opts.toolbar)) {
                $("div.datagrid-toolbar", panel).remove();
                var tb = $("<div class=\"datagrid-toolbar\"><table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table></div>").prependTo(panel);
                var tr = tb.find("tr");
                for (var i = 0; i < opts.toolbar.length; i++) {
                    var btn = opts.toolbar[i];
                    if (btn == "-") {
                        $("<td><div class=\"datagrid-btn-separator\"></div></td>").appendTo(tr);
                    } else {
                        var td = $("<td></td>").appendTo(tr);
                        var tool = $("<a href=\"javascript:;\"></a>").appendTo(td);
                        tool[0].onclick = eval(btn.handler || function () {
                            });
                        tool.linkbutton($.extend({}, btn, {plain: true}));
                    }
                }
            } else {
                $(opts.toolbar).addClass("datagrid-toolbar").prependTo(panel);
                $(opts.toolbar).show();
            }
        } else {
            $("div.datagrid-toolbar", panel).remove();
        }

        //加载分页栏
        $("div.datagrid-pager", panel).remove();
        if (opts.pagination) {
            var pager = $("<div class=\"datagrid-pager\"></div>");
            if (opts.pagePosition == "bottom") {
                pager.appendTo(panel);
            } else {
                if (opts.pagePosition == "top") {
                    pager.addClass("datagrid-pager-top").prependTo(panel);
                } else {
                    var pagerTop = $("<div class=\"datagrid-pager datagrid-pager-top\"></div>").prependTo(panel);
                    pager.appendTo(panel);
                    pager = pager.add(pagerTop);
                }
            }
            pager.pagination({
                total: 0,
                pageNumber: opts.pageNumber,
                pageSize: opts.pageSize,
                pageList: opts.pageList,
                onSelectPage: function (pageNum, pageSize) {
                    opts.pageNumber = pageNum || 1;
                    opts.pageSize = pageSize;
                    pager.pagination("refresh", {pageNumber: pageNum, pageSize: pageSize});
                    request(target);
                }
            });
            opts.pageSize = pager.pagination("options").pageSize;
        }

        //加载排序栏
        $("div.datagrid-header-inner", panel).css("display", "block").html("");
        if (opts.multiSortNames) {
            var header = createColumnHeader(opts.multiSortNames);
            $("div.datagrid-header-inner", panel).append(header);
        }
        //给queryParam 增加默认排序
        if (opts.sortName && opts.sortOrder) {
            opts.queryParams = $.extend({}, opts.queryParams, {sortName: opts.sortName, sortOrder: opts.sortOrder});
            var sortColumn = $("div.datagrid-header-inner", panel).find("td[field='" + opts.sortName + "']");
            sortColumn.find(".datagrid-cell").addClass("datagrid-sort-" + opts.sortOrder);
        }
    }

    /**
     * 加载完数据后 监听事件
     */
    function listenToEvents(target) {
        var panel = $.data(target, 'datacard').panel;
        var opts = $.data(target, 'datacard').options;

        //处理卡片 hover事件
        $('.datacard', panel).hover(function () {
            $(this).addClass('card-hover');
        }, function () {
            $(this).removeClass('card-hover');
        });

        //处理卡片 checkbox hover事件
        $('.cardview .checkbox', panel).hover(function () {
            var $node = $(this).find(".icon");
            if ($node.hasClass('icon-check')) {
                $node.removeClass('icon-check');
                $node.addClass("icon-checking")
            }
        }, function () {
            var $node = $(this).find(".icon");
            if ($node.hasClass('icon-checking')) {
                $node.removeClass('icon-checking');
                $node.addClass("icon-check")
            }
        });

        //处理卡片 checkbox click事件(选中，取消选中)
        $('.cardview .checkbox', panel).unbind('click');
        $('.cardview .checkbox', panel).bind('click', function (event) {
            var $node = $(this).find(".icon");
            var $pNode = $(this).parents("li");
            if ($node.hasClass('icon-checked')) {
                $(target).datacard("unSelect", $pNode);
            } else {
                $(target).datacard("select", $pNode);
            }
            event.stopPropagation();
        });

        //处理卡片 click事件
        $('.cardview .datacard', panel).unbind('click');
        $('.cardview .datacard', panel).bind('click', function () {
            if ($(this).hasClass('card-hover')) {
                $(target).datacard("select", $(this));
            }
        });

        //处理check all 事件
        $('div.datagrid-header-check input:checkbox', panel).unbind('click');
        $('div.datagrid-header-check input:checkbox', panel).bind('click', function () {
            if ($(this)[0] && $(this)[0].checked) {
                $(target).datacard("selectAll");
            } else {
                $(target).datacard("unSelectAll");
            }
        });

        //处理排序字段
        $('.datagrid-header td:has(.datagrid-cell)', panel).hover(
            function () {
                $(this).addClass('datagrid-header-over');
            },
            function () {
                $(this).removeClass('datagrid-header-over');
            }
        );

        $('.datagrid-header td .datagrid-cell', panel).unbind('click');
        $('.datagrid-header td .datagrid-cell', panel).bind('click', function () {
            var field = $(this).parents("td").attr("field");
            if ($(this).hasClass('datagrid-sort-asc')) {
                $(this).removeClass('datagrid-sort-asc');
                $(this).addClass('datagrid-sort-desc');
                opts.queryParams = $.extend({}, opts.queryParams, {
                    sortName: field,
                    sortOrder: 'desc'
                });
                if (opts.remoteSort) {
                    request(target, opts.queryParams);
                }
                opts.onSortColumn.call(target, opts.sortName, opts.sortOrder);
            } else {
                $(this).removeClass('datagrid-sort-desc');
                $(this).addClass('datagrid-sort-asc');
                opts.queryParams = $.extend({}, opts.queryParams, {
                    sortName: field,
                    sortOrder: 'asc'
                });
                if (opts.remoteSort) {
                    request(target, opts.queryParams);
                }
                opts.onSortColumn.call(target, opts.sortName, opts.sortOrder);
            }
        });

    }

    /**
     * 修复卡片大小
     */
    function fixCardSize(target, flag) {
        var opts = $.data(target, 'datacard').options;
        var panel = $.data(target, 'datacard').panel;
        var iView = panel.find(".datagrid-iView");
        var ul = $('.cardview', panel);
        var cardsBody = $('.datagrid-body', panel);
        ul.width(cardsBody.width());
        ul.height(cardsBody.height());

        var cardOpts = {
            width: opts.cardWidth ? opts.cardWidth : "",
            height: opts.cardHeight ? opts.cardHeight : ""
        };
        var card = iView.find(".datacard");
        var cardIWrap = iView.find(".datacard-iWrap");
        var cardIWrapImg = $(".datacard-iWrap .datacardImg-wrap");
        if (card && cardOpts.width) {
            if (opts.imgMaxWidth) {
                cardIWrapImg.width(opts.imgMaxWidth + 2);
            }
            if (+cardOpts.width) {
                card.css('width', cardOpts.width + "px");
            } else if (/%/.test(cardOpts.width)) {
                var cardWidth = iView.width() * mast.utils.transformPercentageToNumber(cardOpts.width) - opts.paddingWidth;
                if (cardWidth > opts.imgMaxWidth) {
                    card.css('width', cardWidth + "px")
                }
            } else {
                card.css('width', cardOpts.width);
            }
        }
        if (card && cardOpts.height) {
            if (opts.imgMaxHeight) {
                cardIWrapImg.height(opts.imgMaxHeight + 2);
            }
            if (+cardOpts.height) {
                card.css('height', cardOpts.height + "px");
            } else if (cardOpts.height == 'auto' && flag) {
                //由于图片延迟加载 需要加上图片最大高度
                card.css('height', cardOpts.height);
                if (card.find(".datacardImg-wrap").height() < opts.imgMaxHeight) {
                    card.css('height', card.height() + opts.imgMaxHeight);
                } else {
                    card.css('height', card.height() + 10);
                }
            }

        }
    }

    /**
     * 加载数据
     */
    function loadData(target, data) {
        var panel = $.data(target, 'datacard').panel;
        var opts = $.data(target, 'datacard').options;
        var pager = $(target).datacard("getPager");

        //调用 loadFilter
        data = opts.loadFilter.call(panel, data);

        //填写数据
        var rows = data.rows;
        if (rows) {
            var iView = $('.datagrid-iView', panel);
            var cards = iView.children('.datagrid-body');
            cards.show();
            cards.empty();

            //获取要填写的字段
            var columns = getColumns(target);
            var fields = getColumnFields(columns);

            //存在opts.view 重新渲染datagrid-body
            if (opts.view) {
                //TODO:
                // return opts.view.renderBodyView.call(target, rows, fields);
            }

            //拼写UlBody
            function getUlBody(fields) {

                var row, striped, len = rows.length;
                var ulBody = ['<ul class="card-clearfix cardview">'];
                for (var i = 0; i < len; i++) {
                    row = rows[i];
                    if (opts.formatterCardBackground) {
                        striped = opts.formatterCardBackground.call(target, row);
                    }
                    if (striped) {
                        ulBody.push('<li datagrid-row-index="' + i + '" class="datacard datacard-alt');
                    } else {
                        ulBody.push('<li datagrid-row-index="' + i + '" class="datacard');
                    }
                    // if (selected == true) {
                    //     ulBody.push(' datagrid-row-selected');
                    // }
                    if (opts.showBackgroundFolder) {
                        ulBody.push(" bg-folder");
                    }
                    ulBody.push('">');

                    ulBody.push('<div class="datacard-iWrap" >');

                    for (var j = 0; j < fields.length; j++) {
                        var field = fields[j];
                        var col = getColumnOption(columns, field);
                        if (col) {
                            var style = 'text-align:' + (col.align || 'left');
                            ulBody.push('<div field=' + field + ' class="datacard-column-' + field + '"');
                            if (col.hidden) {
                                ulBody.push(' style="display:none;" ');
                            }
                            ulBody.push('>');
                            ulBody.push('<div class="datacard-cell');
                            if (col.isImage) {
                                ulBody.push(' datacardImg-wrap');
                                ulBody.push('">');
                                if (col.formatter) {
                                    ulBody.push(col.formatter(row[field], row));
                                }
                            } else {
                                ulBody.push('" style="' + style + '"');
                                ulBody.push('">');
                                if (!col.noTitle) {
                                    ulBody.push('<label>' + col.title + '：</label>');
                                }
                                ulBody.push('<span>');
                                if (col.formatter) {
                                    ulBody.push(col.formatter(row[field], row));
                                } else {
                                    ulBody.push(row[field]);
                                }
                                ulBody.push('</span>');
                            }
                            ulBody.push('</div>');
                            if (col.isImage && opts.datacardStatus) {
                                ulBody.push("<div class='datacard-status'></div>")
                            }
                            ulBody.push('</div>');
                        }
                    }
                    if (opts.checkbox) {
                        ulBody.push('    <span class="checkbox icon-circle">' +
                            '      <span class="icon icon-check"></span>' +
                            '    </span>');
                    }
                    ulBody.push('</div>');
                    ulBody.push('</li>');
                }
                ulBody.push('</ul>');
                return ulBody.join('');
            }

            cards.append(getUlBody(fields));

            $.data(target, 'datacard').data = data;
            $('.datagrid-pager', panel).pagination({total: data.total});
            fixCardSize(target, true);
            //加载完数据 监听事件
            listenToEvents(target);
            $(target).datacard('clearSelections');
            pager.pagination("refresh", {pageNumber: opts.pageNumber, pageSize: opts.pageSize});
            opts.onLoadSuccess.call(target, data);
        }
    }

    function onHeaderCheckboxClick() {

    }

    function dealSelect(target) {
        var panel = $(target).datacard("getPanel");
        var arr = [];
        $.each($('.datacard.card-active,.datacard.card-hover', panel), function (index, node) {
            arr.push(dealSelectSelf(node));
        });
        return arr;
    }

    function dealSelectSelf(target) {
        var children = $(target).find(".datacard-iWrap").children();
        var obj = {}, field, value;
        $.each(children, function (i, cNode) {
            field = $(cNode).attr('field');
            value = $('.datacard-cell span', cNode).text().trim();
            field && (obj[field] = value);
        });
        return obj;
    }

    function getIndex(target) {
        if (!target) return 0;
        return $(target).attr("datagrid-row-index").trim();
    }

    function unCheckAllBox(target, type) {
        var panel = $(target).datacard("getPanel");
        var check = $('div.datagrid-header-check input:checkbox', panel)[0];
        check && (check.checked = type ? type : false);
    }

    function request(target, queryParams, cb) {
        var opts = $.data(target, "datacard").options;
        if (queryParams) {
            opts.queryParams = queryParams;
        }
        var params = $.extend({}, opts.queryParams);
        if (opts.pagination) {
            $.extend(params, {page: opts.pageNumber || 1, rows: opts.pageSize});
        }
        //默认排序
        if (opts.sortName) {
            $.extend(params, {sort: opts.sortName, order: opts.sortOrder});
        }
        //header排序
        if (opts.queryParams.sortName) {
            $.extend(params, {sort: opts.queryParams.sortName, order: opts.queryParams.sortOrder});
        }
        if (opts.onBeforeLoad.call(target, params) == false) {
            return;
        }
        $(target).datacard("loading");
        var loadResult = opts.loader.call(target, params, function (data) {
            $(target).datacard("loaded");
            $(target).datacard("loadData", data);
            if (cb) {
                cb();
            }
        }, function () {
            $(target).datacard("loaded");
            opts.onLoadError.apply(target, arguments);
        });
        if (loadResult == false) {
            $(target).datacard("loaded");
        }
    }

    $.fn.datacard = function (options, param) {
        if (typeof options == 'string') {
            return $.fn.datacard.methods[options](this, param);
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'datacard');
            var opts;
            if (state) {
                opts = $.extend(state.options, options);
                state.options = opts;
            } else {
                opts = $.extend({}, $.extend({}, $.fn.datacard.defaults, {queryParams: {}}), $.fn.datacard.parseOptions(this), options);
                $(this).css('width', "").css('height', "");
                var wrapResult = wrapCard(this);
                if (!opts.columns) {
                    opts.columns = wrapResult.columns;
                }
                opts.columns = $.extend(true, [], opts.columns);
                opts.view = $.extend({}, opts.view);
                $.data(this, 'datacard', {
                    options: opts,
                    panel: wrapResult.panel,
                    dc: wrapResult.dc,
                    ss: null,
                    selectedRows: [],
                    data: {total: 0, rows: []}
                });
            }

            //根据配置设置相关内容
            setProperties(this);

            //设置基本结构的大小
            setSize(this);

            //加载本地数据
            if (opts.data) {
                $(this).datacard("loadData", opts.data);
            } else {
                var data = $.fn.datacard.parseData(this);
                if (data.total > 0) {
                    $(this).datacard("loadData", data);
                } else {
                    opts.view.setEmptyMsg(this);
                }
            }

            //加载远程数据
            request(this);
        });
    };

    $.fn.datacard.methods = {
        options: function (jq) {
            var cardb = $.data(jq[0], "datacard").options;
            var cardc = $.data(jq[0], "datacard").panel.panel("options");
            var opts = $.extend(cardb, {
                width: cardc.width,
                height: cardc.height,
                closed: cardc.closed,
                collapsed: cardc.collapsed,
                minimized: cardc.minimized,
                maximized: cardc.maximized
            });
            return opts;
        },
        getPanel: function (jq) {
            return $.data(jq[0], "datacard").panel;
        },
        getPager: function (jq) {
            return $.data(jq[0], "datacard").panel.children("div.datagrid-pager");
        },
        getColumnFields: function (jq, columns) {

            return [];
        },
        getColumnOption: function (jq, column) {

        },
        resize: function (jq, target) {
            return jq.each(function () {
                setSize(this);
            });
        },
        load: function (jq, param) {
            return jq.each(function () {
                request(this, param);
            });
        },
        reload: function (jq, param) {
            return jq.each(function () {
                request(this, param);
            });
        },
        reloadFooter: function (jq, target) {

        },
        loading: function (jq) {
            return jq.each(function () {
                var opts = $.data(this, "datacard").options;
                $(this).datacard("getPager").pagination("loading");
                if (opts.loadMsg) {
                    var opts4 = $(this).datacard("getPanel");
                    if (!opts4.children("div.datagrid-mask").length) {
                        $("<div class=\"datagrid-mask\" style=\"display:block\"></div>").appendTo(opts4);
                        var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block;left:50%\"></div>").html(opts.loadMsg).appendTo(opts4);
                        msg._outerHeight(40);
                        msg.css({marginLeft: (-msg.outerWidth() / 2), lineHeight: (msg.height() + "px")});
                    }
                }
            });
        },
        loaded: function (jq) {
            return jq.each(function () {
                $(this).datacard("getPager").pagination("loaded");
                var panel = $(this).datacard("getPanel");
                panel.children("div.datagrid-mask-msg").remove();
                panel.children("div.datagrid-mask").remove();
            });
        },
        loadData: function (jq, data) {
            return jq.each(function () {
                loadData(this, data);
            });
        },
        select: function (jq, target) {
            return jq.each(function () {
                if (!target || !$(target).hasClass('datacard')) return;
                var opts = $(this).datacard("options");

                var rowData = dealSelectSelf(target);
                var index = getIndex(target);
                //回调选择之前的方法
                opts.onBeforeSelect(index, rowData);
                if (opts.singleSelect) {
                    $(this).datacard("unSelectAll");
                }
                var $node = $(target).find(".icon");
                $node.removeClass('icon-checking');
                $node.addClass("icon-checked");
                $(target).addClass("card-active");

                var panel = $(this).datacard("getPanel");
                if ($('.datacard', panel).length === $('.datacard.card-active', panel).length) {
                    unCheckAllBox(this, true);
                }
                //回调选择方法
                opts.onSelect.call(this, index, rowData);
            });
        },
        unSelect: function (jq, target) {
            return jq.each(function () {
                if (!target || !$(target).hasClass('datacard')) return;
                var opts = $(this).datacard("options");
                var $node = $(target).find(".icon");
                $node.removeClass('icon-checked');
                $node.addClass("icon-checking");
                $(target).removeClass("card-active");

                //处理回掉事件
                var rowData = dealSelectSelf(target);
                var index = getIndex(target);
                opts.onUnSelect.call(this, index, rowData);
                unCheckAllBox(this);
            });
        },
        selectAll: function (jq) {
            return jq.each(function () {
                var panel = $(this).datacard("getPanel");

                $.each($('.datacard', panel), function (index, target) {
                    var $node = $(target).find(".icon");
                    $node.removeClass('icon-checking');
                    $node.addClass("icon-checked");
                    $(target).addClass("card-active");
                });
                //处理回掉事件
                var opts = $(this).datacard("options");
                var rows = dealSelect(this);
                opts.onSelectAll.call(this, rows);
            })
        },
        unSelectAll: function (jq) {
            return jq.each(function () {
                var panel = $(this).datacard("getPanel");
                $.each($('.datacard.card-active', panel), function (index, target) {
                    var $node = $(target).find(".icon");
                    $node.removeClass('icon-checked');
                    $node.addClass("icon-checking");
                    $(target).removeClass("card-active");
                });
                //处理回掉事件
                var opts = $(this).datacard("options");
                var rows = dealSelect(this);
                opts.onUnSelectAll.call(this, rows);
            })
        },
        hasSelected: function (jq, index) {
            var flag = false;
            var panel = $(jq[0]).datacard("getPanel");
            var target = $('li[datagrid-row-index="' + index + '"]', panel);
            if (target.hasClass('card-active')) {
                flag = true;
            }
            return flag;
        },
        getData: function (jq) {
            return $.data(jq[0], "datagrid").data;
        },
        getRows: function (jq) {

        },
        getChecked: function (jq) {

        },
        getSelected: function (jq) {
            var rows = dealSelect(jq[0]);
            return rows.length > 0 ? rows[0] : null;
        },
        getSelections: function (jq) {
            return dealSelect(jq[0]);
        },
        clearSelections: function (jq) {
            return jq.each(function () {
                $(this).datacard("unSelectAll");
                unCheckAllBox(this)
            });
        },
        clearChecked: function (jq) {

        }
    };

    $.fn.datacard.parseOptions = function (target) {
        var t = $(target);
        return $.extend({}, $.fn.panel.parseOptions(target), $.parser.parseOptions(target, ["url", "toolbar", "idField", "sortName", "sortOrder", "pagePosition", "resizeHandle", {
            sharedStyleSheet: "boolean",
            fitColumns: "boolean",
            autoRowHeight: "boolean",
            striped: "boolean",
            nowrap: "boolean"
        }, {
            rownumbers: "boolean",
            singleSelect: "boolean",
            ctrlSelect: "boolean",
            checkOnSelect: "boolean",
            selectOnCheck: "boolean"
        }, {pagination: "boolean", pageSize: "number", pageNumber: "number"}, {
            multiSort: "boolean",
            remoteSort: "boolean",
            showHeader: "boolean",
            showFooter: "boolean"
        }, {scrollbarSize: "number"}]), {
            pageList: (t.attr("pageList") ? eval(t.attr("pageList")) : undefined),
            loadMsg: (t.attr("loadMsg") != undefined ? t.attr("loadMsg") : undefined),
            rowStyler: (t.attr("rowStyler") ? eval(t.attr("rowStyler")) : undefined)
        });
    };
    $.fn.datacard.parseData = function (target) {
        var t = $(target);
        var data = {total: 0, rows: []};
        var columnFields = t.datacard("getColumnFields", true).concat(t.datacard("getColumnFields", false));
        t.find("ul li").each(function () {
            data.total++;
            var row = {};
            $.extend(row, $.parser.parseOptions(this, ["iconCls", "state"]));
            for (var i = 0; i < columnFields.length; i++) {
                row[columnFields[i]] = $(this).find("td:eq(" + i + ")").html();
            }
            data.rows.push(row);
        });
        return data;
    };

    var cardView = {
        render: function () {

        }, renderFooter: function () {

        }, renderCard: function () {

        }, getStyleValue: function () {

        }, setEmptyMsg: function (target) {
            var card = $.data(target, "datacard");
            var opts = card.options;
            // var rows = opts.finder.getRows(target).length == 0;
            // if (rows) {
            //     this.renderEmptyRow(target);
            // }
            // if (opts.emptyMsg) {
            //     card.dc.view.children(".datagrid-empty").remove();
            //     if (rows) {
            //         var h = card.dc.header.parent().outerHeight();
            //         var d = $("<div class=\"datagrid-empty\"></div>").appendTo(card.dc.view);
            //         d.html(opts.emptyMsg).css("top", h + "px");
            //     }
            // }
        }
    };

    $.fn.datacard.defaults = $.extend({}, $.fn.panel.defaults, {
        sharedStyleSheet: false,
        frozenColumns: undefined,
        columns: undefined,
        fitColumns: false,
        resizeHandle: "right",
        autoRowHeight: true,
        toolbar: null,
        striped: false,
        method: "post",
        nowrap: true,
        idField: null,
        url: null,
        data: null,
        loadMsg: "Processing, please wait ...",
        emptyMsg: "",
        rownumbers: false,
        singleSelect: false,
        ctrlSelect: false,
        selectOnCheck: true,
        checkOnSelect: true,
        pagination: false,
        pagePosition: "bottom",
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 20, 30, 40, 50],
        queryParams: {},
        sortName: null,
        sortOrder: "asc",
        multiSort: false,
        remoteSort: true,
        showHeader: true,
        showFooter: false,
        /*新增部分配置项*/
        multiSortNames: undefined, //多个排序字段，默认由sortName指定
        cardWidth: 'auto',
        cardHeight: 'auto',
        checkbox: false,
        datacardStatus: true,
        imgMaxHeight: 153,
        imgMaxWidth: 153,
        showBackgroundFolder: false,
        paddingWidth: 20,
        view: cardView,
        /**
         * 根据value 自定义卡片背景色
         */
        formatterCardBackground: function (value) {
            return "";
        },
        loader: function (queryParams, loadSuccess, loadError) {
            var opts = $(this).datacard("options");
            if (!opts.url) {
                return false;
            }
            $.ajax({
                type: opts.method, url: opts.url, data: queryParams, dataType: "json", success: function (data) {
                    loadSuccess(data);
                }, error: function () {
                    loadError.apply(this, arguments);
                }
            });
        },
        loadFilter: function (data) {
            return data;
        },
        onBeforeLoad: function () {

        },
        onLoadSuccess: function (data) {
        },
        onLoadError: function () {
        },
        onClickCard: function (rowIndex, rowData) {
        },
        onDblClickCard: function (rowIndex, rowData) {
        },
        onSortColumn: function (sort, order) {
        },
        onBeforeSelect: function (index, row) {

        },
        onSelect: function (rowIndex, rowData) {
        },
        onUnSelect: function (rowIndex, rowData) {
        },
        onSelectAll: function () {

        },
        onUnSelectAll: function () {

        },
        onResize: function (width, height) {

        },
        onExpand: function () {

        }
    });
})(jQuery);

