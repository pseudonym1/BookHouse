/**
 * permissiontree - jQuery EasyUI
 * 权限树
 *
 * Dependencies:
 *   tree
 *
 * since: 1.5.1
 */
(function ($) {

    //复制tree
    $.fn.permissiontree = $.fn.tree;

    //扩展方法
    $.fn.permissiontree.methods = $.extend({}, $.fn.tree.methods, {
        /**
         * 获取资源可授权信息
         */
        getResourceAuthorizedMap: function (jq) {
            var opts = $(jq[0]).permissiontree("options"),
                authorized = opts._authorized;
            return getResourceMap.call(jq[0], authorized);
        },
        /**
         * 获取资源可访问信息
         */
        getResourceAccessibleMap: function (jq) {
            var opts = $(jq[0]).permissiontree("options"),
                accessible = opts._accessible;
            return getResourceMap.call(jq[0], accessible);
        },
        /**
         * 设置资源可授权状态
         */
        setResourceAuthorized: function (jq, data) {
            var opts = $(jq[0]).permissiontree("options"),
                authorized = opts._authorized;
            return setResourceMap.call(jq[0], authorized, data);
        },
        /**
         * 设置资源可访问状态
         */
        setResourceAccessible: function (jq, data) {
            var opts = $(jq[0]).permissiontree("options"),
                accessible = opts._accessible;
            return setResourceMap.call(jq[0], accessible, data);
        },
        /**
         * 获取tree原生对象，即树的dom内容
         */
        getTreeUl: function (jq) {
            var root = $(jq[0]).permissiontree("getRoot"),
                rootTarget = root.target;
            return $(rootTarget).parents("ul");
        }
    });

    /**
     * 获取资源信息
     */
    function getResourceMap(type) {
        var self = this,
            opts = $(self).permissiontree("options"),
            _resourceType = opts._resourceType,
            _resourceValue = opts._resourceValue,
            _authorized = opts._authorized,
            _accessible = opts._accessible,
            resourceType = opts.resourceType,
            permissionType = opts.permissionType,
            treeUl = $(self).permissiontree("getTreeUl"),
            result = [],
            rootNode = $(self).permissiontree("getRoot");
        $.each($("." + type + ":checked", treeUl), function (index, checkbox) {
            var nodeType = $(checkbox).data(_resourceType),
                nodeValue = $(checkbox).data(_resourceValue),
                treeNode = $(self).permissiontree("find", nodeValue),
                obj = {};

            if (checkbox.checked) {
                if (nodeType == resourceType[0]) { //目录
                    if (!opts.isSaveRoot && (rootNode.id == treeNode.id)) {
                        //no deal
                    } else {
                        obj = setRoleResourcePermission(treeNode.id, 1, (type == _authorized), (type == _accessible));
                        result.push(obj);
                    }
                } else if (nodeType == resourceType[1]) { //模块
                    var permissionIds = [];
                    var childNodes = $("." + type + ":checked", $(treeNode.target).next("ul"));
                    if (childNodes.length == treeNode.children.length) {
                        permissionIds.push(1);
                    } else {
                        var childNodeValue;
                        $.each(childNodes, function (index, node) {
                            childNodeValue = getPermissionId($(node).data(_resourceValue));
                            permissionIds.push(childNodeValue);
                        })
                    }
                    obj = setRoleResourcePermission(treeNode.id, permissionIds.join(","), (type == _authorized), (type == _accessible));
                    result.push(obj);
                } else if (nodeType == resourceType[2]) { //操作
                    obj = setRoleResourcePermission(treeNode.id, 1, (type == _authorized), (type == _accessible));
                    result.push(obj);
                } else if (nodeType == permissionType) {
                    //no deal
                }
            }
        });

        function getPermissionId(permissionId) {
            if (/_/.test(permissionId)) {
                return permissionId.split("_")[1];
            } else {
                return permissionId;
            }
        }

        function setRoleResourcePermission(resourceId, permissionIds, authorized, accessibly) {
            return {
                resourceId: resourceId,
                permissionIds: permissionIds,
                authorized: authorized ? 1 : 0,
                accessibly: accessibly ? 1 : 0
            }
        }

        return result;
    }

    /**
     * 设置资源状态、及resourceType,value等信息
     */
    function setResourceMap(type, data) {
        if (!data || !type) return;
        var self = this,
            treeNode, nodeType, permissionInput;

        $.each(data, function (index, resObj) {
            treeNode = $(self).permissiontree("find", resObj.resourceId);
            nodeType = treeNode.attributes && treeNode.attributes.type;

            //设置自身状态
            permissionInput = $("." + type, treeNode.target);
            permissionInput[0].checked = true;
            if (nodeType == 1) { //目录
                //no deal
            } else if (nodeType == 3) {//操作
                //no deal
            } else if (nodeType == 2) {//模块
                var subTreeNode, subInput, permissionIds = [];
                //处理子节点状态
                if (resObj.permissionIds && resObj.permissionIds != 1) {
                    permissionIds = resObj.permissionIds.split(",");
                    $.each(permissionIds, function (index, subId) {
                        subId = resObj.resourceId && (resObj.resourceId + "_" + subId);
                        subTreeNode = $(self).permissiontree("find", subId);
                        subInput = $("." + type, subTreeNode.target);
                        subInput[0].checked = true;
                    })
                } else if (resObj.permissionIds == 1) {
                    $.each(treeNode.children, function (index, subObj) {
                        subTreeNode = $(self).permissiontree("find", subObj.id);
                        subInput = $("." + type, subTreeNode.target);
                        subInput[0].checked = true;
                    })
                }
            }
        });
    }

    //扩展配置项
    $.fn.permissiontree.defaults = $.extend({}, $.fn.tree.defaults, {
        authorizedField: "authorized",
        authorizedText: $("#authorized").text(),//"可授权",
        accessibleField: "accessibly",
        accessibleText: $("#accessible").text(),//"可访问",
        permissionUrl: null, //回显权限树必须用的
        permissionParams: null,
        resourceType: ["category", "module", "operation"], //资源类型 1：Category(目录)，2：Module(模块)，3：Operation(操作)
        permissionType: "permission",
        isSaveRoot: true, //是否保存跟节点信息
        /*私有属性，规定死*/
        _resourceType: "type",
        _resourceValue: "value",
        _authorized: "check-authorized",
        _accessible: "check-accessible",

        /**
         * 核心，创建可访问、可授权checkbox。
         * @warn 禁止重写这个方法
         */
        formatter: function (node) {
            var opts = $(this).permissiontree('options');
            var type;
            if (node.attributes && node.attributes.type) {
                type = opts.resourceType[node.attributes.type - 1]
            } else {
                type = "permission"
            }
            var nodeExtend = "<span>&nbsp;(&nbsp;" + "<input type='checkbox' data-type='" + type + "' class='check-authorized' " +
                "style='vertical-align: middle;' " + "name='" + opts.authorizedField + "' data-value=" + node.id + " >" + opts.authorizedText +
                "&nbsp;<input type='checkbox' data-type='" + type + "' class='check-accessible' style='vertical-align: middle;' " +
                "name='" + opts.accessibleField + "' data-value=" + node.id + " >" + opts.accessibleText + "&nbsp;)</span>";
            return node.text + nodeExtend;
        },
        /**
         * 核心，回显数据、处理事件
         * @warn 禁止重写这个方法
         */
        onLoadSuccess: function () {
            var self = this,
                opts = $(self).permissiontree('options');

            //回显权限
            loadPermissionData.call(self, opts.permissionUrl, opts.permissionParams);

            //处理checkbox事件
            dealCheckboxEvent.call(self)
        }
    });

    /**
     * 加载资源权限数据
     */
    function loadPermissionData(url, params) {
        var self = this;
        if (!url || !params) {
            console.log("Warning! permissionUrl or permissionParams has not.");
        }
        $.ajax({
            url: url,
            type: "POST",
            data: params,
            dataType: "json",
            success: function (result) {
                if (!result) {
                    console.log("Warning! permissionData is empty.");
                } else {
                    setRoleResourcePermission.call(self, result);
                }
            }
        });
    }

    /**
     * 设置已分配的权限(回显)
     * @param data 回显数据
     */
    function setRoleResourcePermission(data) {
        if (data && data.authorized) {
            $(this).permissiontree("setResourceAuthorized", data.authorized);
        }
        if (data && data.accessibly) {
            $(this).permissiontree("setResourceAccessible", data.accessibly);
        }

    }

    /**
     * 处理checkbox事件，
     * bind click事件
     */
    function dealCheckboxEvent() {
        var treeUl = $(this).permissiontree("getTreeUl");
        //绑定可授权
        $(".check-authorized", treeUl).unbind('click');
        $(".check-authorized", treeUl).bind('click', function () {
            dealPermissionClick.call(this, "check-authorized");
        });
        //绑定可访问
        $(".check-accessible", treeUl).unbind('click');
        $(".check-accessible", treeUl).bind('click', function () {
            dealPermissionClick.call(this, "check-accessible");
        });

        /**
         * 处理可授权、可访问单击事件
         * @param type 类型 check-authorized，check-accessible
         */
        function dealPermissionClick(type) {
            var $permission = $(this), permissionInput, firstChild, flag = this.checked;
            //处理子节点
            var selfParent = $permission.parents("li")[0];
            $.each($(selfParent).children("ul").find("li > div"), function (index, child) {
                permissionInput = $(child).find("." + type)[0];
                permissionInput && (permissionInput.checked = flag);
            });

            //处理父节点
            $.each($permission.parents("li"), function (index, parent) {
                //自身不处理
                if (index > 0) {
                    firstChild = parent.firstChild;
                    permissionInput = $(firstChild).find("." + type)[0];
                    if (!flag) {
                        if (isNeededToCancelParentChecked(parent, type)) {
                            permissionInput && (permissionInput.checked = flag);
                        }
                    } else {
                        permissionInput && (permissionInput.checked = flag);
                    }
                }
            });
        }

        /**
         * 判断是否需要 取消父节点的checked状态
         */
        function isNeededToCancelParentChecked(target, type) {
            var len = 0;
            if (target && target.children) {
                var $authorizedChecked = $(target.children).find("." + type + ":checked");
                len = $authorizedChecked.length;
            }
            return len <= 1;
        }
    }

})(jQuery);