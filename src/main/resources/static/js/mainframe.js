/**
 * 主页
 * create on 2016/10/26
 *
 * @author Dicky
 */
!function () {
    /**
     * MainFrame 对象
     */
    var MainFrame = my.Class({
        STATIC: {
            ALARM: $("#waringlist").text(),
            URL_MENUTREE: mast.basePath + '/sys/mainFrame/loadCategoryMenuTree',
            URL_EX_MENUTREE: mast.basePath + '/sys/mainFrame/loadModuleMenuTree',
            URL_LINK_WORKBENCH: mast.basePath + '/sys/welcome/main',
            URL_LINK_ALARM: mast.basePath + "/monitor/alarm/main"
        },
        constructor: function () {
            this.sidebarTree = $("#sidebar"); //左边栏功能菜单树
            this.contentTabs = $("#contentTab"); //内容页选项卡
            this.sysMenuPanelP = $("#topnav_m,#sysMenuPanel"); //系统菜单父集
            this.sysMenuPanel = $("#sysMenuPanel"); //系统菜单

            this.mainMenu = $("#mainMenu"); //右键菜单
        },
        /**
         * 创建tabs 记得传ID，避免重复创建
         * @param options
         */
        createContentTab: function (options) {
            this.contentTabs.tabs('addIframeTab', {
                tab: {
                    title: options.text,
                    closable: typeof options['closable'] == "boolean" ? options['closable'] : true
                },
                iframe: {
                    src: options.entry,
                    name: options.id,
                    message: $("#loading").text()
                }
            });
        },
        refreshTab: function (config) {
            this.contentTabs.tabs('updateIframeTab', {
                which: config.title,
                iframe: {
                    src: config.url,
                    name: config.id,
                    message: $("#loading").text()
                }
            })
        },
        getTabPath: function (nodeId) {
            if (nodeId && nodeId.indexOf('iframe_name') >= 0) {
                return [];
            }
            var node = this.sidebarTree.tree('find', nodeId),
                rootNode = this.sidebarTree.tree('getParent', node.target),
                current = node.text,
                root = rootNode.text;
            return [root, current];
        },
        jumpToPage: function () {

        }
    });

    mast.MainFrame = MainFrame;
}();

/**
 * UI 处理
 */
!function () {
    var mainFrame = mast.mainFrame = new mast.MainFrame();

    var UIObj = {
        eventInit: function () {
            //监听系统菜单(右上角)
            mainFrame.sysMenuPanelP.mouseover(function () {
                mainFrame.sysMenuPanel.panel({
                    noheader: true,
                    bodyCls: 'sys-menu'
                }).panel("open");
            });
            mainFrame.sysMenuPanelP.mouseout(function () {
                mainFrame.sysMenuPanel.panel("close");
            });
            //告警三分钟刷新一次
            var alarmInterval = setInterval(function () {
                //通知未处理
                $.ajax({
                    url: mast.MainFrame.URL_LOAD_ALARM_NOTICE,
                    type: "POST",
                    dataType: 'json',
                    success: function (data) {
                        if (!data) return;
                        if (data > 0) {
                            $.messager.show({
                                title: $("#warningundeal").text(),
                                msg: $("#youhave").text() + data + $("#warningrecord").text()+"<br>"
                                + "<a href='javascript: (new mast.MainFrame()).jumpToPage();' style='color: red;'>" + "点击处理" + "</a>",
                                timeout: 3 * 1000
                            })
                        }
                    }
                });
            }, 60 * 1000);
            //监听右键事件，创建右键菜单
            mainFrame.contentTabs.tabs({
                onContextMenu: function (e, title, index) {
                    e.preventDefault();
                    if (index > 0) {
                        mainFrame.mainMenu.menu('show', {
                            left: e.pageX,
                            top: e.pageY
                        }).data("tabTitle", title);
                    }
                }
            });

            //右键菜单click
            mainFrame.mainMenu.menu({
                onClick: function (item) {
                    mast.utils.closeTab(this, mainFrame.contentTabs, item.name);
                }
            });
        },
        init: function () {
            //初始化系统时间提示
            // mainFrame.initDate();

            //初始化功能菜单树
            mainFrame.sidebarTree.tree({
                url: mast.MainFrame.URL_MENUTREE,

                loadFilter: function (data) { //过滤 url 返回的数据
                    //debugger;
                    $.each(data, function (index, node) {
                        node.state = node.attributes.type == 2 ? "open" : "closed";
                        node['iconCls'] = !node.attributes.icon ? "" : node.attributes.icon;
                    });
                    return data;
                },

                onBeforeExpand: function () {
                    $("#sidebar").tree('options').url = mast.MainFrame.URL_EX_MENUTREE;
                },

                onDblClick: function (node) {
                    var tempSidebar = $("#sidebar");
                    if (!tempSidebar.tree("isLeaf", node.target)) {
                        node.state == "closed" ? tempSidebar.tree("expand", node.target) :
                            tempSidebar.tree("collapse", node.target);
                    }
                },

                onClick: function (node) {
                    //有子节点不操作
                    if (node && node.attributes.type == 1) return;
                    if (node == null || node.attributes == null) return;
                    if (!node.attributes.url || node.attributes.url == "") return;

                    /*url:在数据库中存在的url，进行树加载的时候放到attributes中*/
                    /*entry：地址*/
                    var entry = mast.basePath + node.attributes.url;
                    var isExists = mainFrame.contentTabs.tabs('exists', node.text);
                    if (isExists) {
                        mainFrame.contentTabs.tabs('select', node.text);
                        mainFrame.refreshTab({
                            id: node.id,
                            title: node.text,
                            url: entry});
                    } else {
                        mainFrame.createContentTab({
                            id: node.id,
                            text: node.text,
                            entry: entry
                        });
                    }
                }
            });

            //增加欢迎页
            mainFrame.createContentTab({
                text: $("#welcome").text(),
                closable: false,
                entry: mast.MainFrame.URL_LINK_WORKBENCH
            });
        }
    };

    //页面加载
    $(document).ready(function () {
        UIObj.init();
        UIObj.eventInit();
    })
}();
