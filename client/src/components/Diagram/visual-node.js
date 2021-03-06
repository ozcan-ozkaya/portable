import _ from 'the-lodash'
import GrowingPacker from './packer.growing'
import { prettyKind } from '../../utils/ui-utils'
import { MONTSERRAT_12PX_500, MONTSERRAT_10PX_500, MONTSERRAT_14PX_500 } from '../../utils/constants'

class VisualNode {

    constructor(view, data, parent) {
        if (!view) {
            throw new Error('View Not Set');
        }
        this._view = view
        this._data = data
        this._parent = parent
        this._children = []
        this._x = 0
        this._y = 0
        this._absX = 0
        this._absY = 0
        this._width = 0
        this._height = 0

        this._padding = this._resolveValue('padding')
        this._paddingLeft = this._padding//this._resolveValue("paddingLeft");

        this._headerPadding = 5
        this._headerWidth = 0
        this._headerHeight = 40

        if (this._parent) {
            this._parent._children.push(this)
            this._depth = this._parent.depth + 1
        } else {
            this._depth = -1
        }

        this._expanderNodes = []
        this._flagNodes = []
        this._severityNodes = []
        this._severityTextNodes = []

        this._setupTheme()
    }

    get view() {
        return this._view
    }

    get node() {
        return this.view._d3NodeDict[this.id]
    }

    get smallNode() {
        return this.view._d3SmallNodeDict[this.id]
    }

    get id() {
        return this._data.dn
    }

    get x() {
        return this._x
    }

    get y() {
        return this._y
    }

    get absX() {
        return this._absX
    }

    get absY() {
        return this._absY
    }

    get width() {
        return this._width
    }

    get height() {
        return this._height
    }

    get headerHeight() {
        return this._headerHeight
    }

    get depth() {
        return this._depth
    }

    get data() {
        return this._data
    }

    get flags() {
        if (!this.data.flags) {
            return []
        }
        if (_.isPlainObject(this.data.flags)) {
            return _.keys(this.data.flags);
        }
        return this.data.flags;
    }

    get expanderNodes() {
        return this._expanderNodes
    }

    get flagNodes() {
        return this._flagNodes
    }

    get severityNodes() {
        return this._severityNodes
    }

    get severityTextNodes() {
        return this._severityTextNodes
    }

    get isExpanded() {
        return this.view.getExpanded(this.id);
    }

    set isExpanded(value) {
        this.view.setExpanded(this.id, value);
    }

    get isSelected() {
        return this.id == this.view._currentSelectedNodeDn;
    }

    get visibleChildren() {
        if (this.isExpanded) {
            return this._children
        }
        return []
    }

    get hasChildren() {
        return this._data.childrenCount > 0
    }

    get isExpandable() {
        return this.hasChildren
    }

    get parent() {
        return this._parent
    }

    get errorCount() {
        return this._getAlertCount('error');
    }

    get warnCount() {
        return this._getAlertCount('warn');
    }

    _getAlertCount(severity)
    {
        if (this.data.alertCount) {
            return this.data.alertCount[severity];
        } 
        return 0;
    }

    get headerFillColor() {
        if (this.isSelected) {
            return this._selectedHeaderFillColor
        }
        return this._headerFillColor
    }

    get headerBgFillColor() {
        return this._headerBgFillColor
    }

    get bgFillColor() {
        if (this.isSelected) {
            return this._selectedBgFillColor
        }
        return this._bgFillColor
    }

    get strokeColor() {
        if (this.isSelected) {
            return this._selectedStrokeColor
        }
        return this._strokeColor
    }

    prepare() {
        this._sortChildren()
        this._determineHeader()
    }

    findChildByRn(rn) {
        for (var x of this._children) {
            if (x.data.rn === rn) {
                return x
            }
        }
        return null
    }

    _determineHeader() {
        this._headers = {}
        this._headersOrder = []

        {
            var size = 32
            this._addToHeader('logo', {
                kind: 'fixed',
                location: 'left',
                width: size,
                height: size,
                padding: (this._headerHeight - size) / 2 - this._headerPadding
            })
        }

        this._addToHeader('title', {
            kind: 'column',
            location: 'left',
            padding: 5,
            cells: [
                {
                    name: 'kind',
                    kind: 'text',
                    text: prettyKind(this.data.kind),
                    fontSpec: MONTSERRAT_10PX_500
                },
                {
                    name: 'name',
                    kind: 'text',
                    text: this.data.name,
                    fontSpec: MONTSERRAT_14PX_500
                }
            ]
        })

        if (this.isExpandable) {
            // eslint-disable-next-line no-redeclare
            var size = 20
            this._addToHeader('expander', {
                kind: 'fixed',
                location: 'right',
                width: size,
                height: size,
                padding: (this._headerHeight - size) / 2 - this._headerPadding
            })

            this._expanderNodes = [
                new VisualNodeHeaderExpander(this, 'expander')
            ]
        } else {
            this._expanderNodes = []
        }

        this._severityNodes = []
        this._severityTextNodes = []

        if (this.warnCount) {
            this._addToHeader('warns', {
                kind: 'text',
                text: this.warnCount,
                fontSpec: MONTSERRAT_12PX_500,
                location: 'right',
                bounding: {
                    height: 20,
                    sidesPadding: 8
                },
            })

            this._severityNodes.push(new VisualNodeSeverity(this, 'warns', 'bounding', SEVERITY_BG_COLOR_WARN))
            this._severityTextNodes.push(new VisualNodeText(this, 'warns'))
        }

        if (this.errorCount) {
            this._addToHeader('errors', {
                kind: 'text',
                text: this.errorCount,
                fontSpec: MONTSERRAT_12PX_500,
                location: 'right',
                bounding: {
                    height: 20,
                    sidesPadding: 8
                },
            })

            this._severityNodes.push(new VisualNodeSeverity(this, 'errors', 'bounding', SEVERITY_BG_COLOR_ERROR))
            this._severityTextNodes.push(new VisualNodeText(this, 'errors'))
        }

        for (var flag of this.flags) {
            this._addToHeader('flag-' + flag, {
                kind: 'icon',
                icon: flag,
                location: 'right'
            })
        }
        this._flagNodes = this.flags.map(x => new VisualNodeHeaderFlag(this, x))

        this._measureHeaders()
    }

    _measureHeaders() {
        var left = this._headerPadding //this._paddingLeft;
        var right = this._headerPadding //this._padding;
        for (var header of this._headersOrder) {
            this._measureHeader(header)

            if (header.bounding) {
                if (header.location === 'left') {
                    if (header.padding) {
                        left += header.padding
                    }
                    header.bounding.left = left
                    header.left = header.bounding.left
                    if (header.bounding.sidesPadding) {
                        header.left += header.bounding.sidesPadding
                    }
                    left += header.bounding.width
                    left += this._headerPadding
                } else if (header.location === 'right') {
                    if (header.padding) {
                        right += header.padding
                    }
                    right += header.bounding.width
                    header.bounding.right = right
                    header.right = header.bounding.right
                    if (header.bounding.sidesPadding) {
                        header.right -= header.bounding.sidesPadding
                    }
                    right += this._headerPadding
                }

                header.bounding.centerY = (this._headerHeight + header.bounding.height) / 2
                header.bounding.top = (this._headerHeight - header.bounding.height) / 2
            } else {
                if (header.location === 'left') {
                    if (header.padding) {
                        left += header.padding
                    }
                    header.left = left
                    left += header.width
                    left += this._headerPadding
                } else if (header.location === 'right') {
                    if (header.padding) {
                        right += header.padding
                    }
                    right += header.width
                    header.right = right
                    right += this._headerPadding
                }
            }

            if (!header.centerY) {
                header.centerY = (this._headerHeight + header.height) / 2
            }
            header.top = (this._headerHeight - header.height) / 2

            if (header.kind === 'column') {
                var top = header.top
                for (var cell of header.cells) {
                    cell.top = top
                    cell.left = header.left
                    cell.right = header.right

                    top += cell.height
                }
            }
        }
        this._headerWidth = left + right
    }

    hasHeader(name) {
        if (this.getHeader(name)) {
            return true
        }
        return false
    }

    getHeader(name) {
        var header = this._headers[name]
        if (!header) {
            return null
        }
        return header
    }

    getHeaderX(name, flavor) {
        var header = this.getHeader(name)
        if (!header) {
            // TODO: Error
            return 0
        }
        var value = 0
        if (header.location === 'left') {
            value = header.left
        } else if (header.location === 'right') {
            value = this.width - header.right
        }
        if (flavor === 'center') {
            value += header.width / 2
        }
        if (flavor === 'bounding') {
            if (header.location === 'left') {
                value = header.bounding.left
            } else if (header.location === 'right') {
                value = this.width - header.bounding.right
            }
        }
        return value
    }

    getHeaderY(name, flavor) {
        var header = this.getHeader(name)
        if (!header) {
            // TODO: Error
            return 0
        }
        if (flavor === 'center') {
            return header.centerY;
        }
        if (flavor === 'bounding') {
            return header.bounding.top
        }
        if (header.kind === 'text') {
            return header.top + header.height / 2 + header.height / 4
        }
        return header.top
    }

    getHeaderCenterX(name) {
        var header = this.getHeader(name)
        if (!header) {
            // TODO: Error
            return 0
        }
        return this.getHeaderX(name) + header.width / 2
    }

    getHeaderCenterY(name) {
        var header = this.getHeader(name)
        if (!header) {
            // TODO: Error
            return 0
        }
        return header.top + header.height / 2
    }

    _measureHeader(header) {
        if (header.kind === 'column') {
            for (var cell of header.cells) {
                this._measureHeader(cell)
            }
            header.width = _.max(header.cells.map(x => x.width))
            header.height = _.sumBy(header.cells, x => x.height)
        } else if (header.kind === 'text') {
            var textDimentions =
                this._view._measureText(header.text, header.fontSpec)
            header.width = textDimentions.width
            header.height = textDimentions.height
        } else if (header.kind === 'icon') {
            header.width = 16
            header.height = 16
        }

        if (header.bounding) {
            if (!header.bounding.height) {
                header.bounding.height = header.height
            }
            if (!header.bounding.width) {
                header.bounding.width = header.width
            }
            if (header.bounding.sidesPadding) {
                header.bounding.width = header.width + header.bounding.sidesPadding * 2
                header.width += header.bounding.sidesPadding * 2
            }
        }
    }

    _addToHeader(name, info) {
        info.id = name
        info.name = info.id
        this._headers[name] = info
        this._headersOrder.push(info)

        if (info.kind === 'column') {
            for (var cell of info.cells) {
                cell.id = name + '-' + cell.name
                cell.location = info.location
                this._headers[cell.id] = cell
            }
        }
    }

    _sortChildren() {
        var result = []
        var groups = _.groupBy(this._children, x => x.data.order)
        var groupIds = _.keys(groups)
        groupIds = _.orderBy(groupIds, x => parseInt(x))
        for (var x of groupIds) {
            var innerList = groups[x]
            innerList = _.orderBy(innerList, x => x.data.rn)
            result = _.concat(result, innerList)
        }
        this._children = result
    }

    measureAndArrange() {
        this._x = 0
        this._y = 0
        this._width = this._headerWidth
        this._height = this._headerHeight

        if (this.visibleChildren.length === 0) {
            return
        }

        for (var child of this.visibleChildren) {
            child.measureAndArrange()
        }

        if (this._getIsArrangedVertically()) {
            this._arrangeChildrenVertically()
        } else if (this._getIsArrangedHorizontally()) {
            this._arrangeChildrenHorizontally()
        } else if (this._getIsArrangedPack()) {
            this._arrangeChildrenPack()
        }

        for (var component of this._getInnerCompontents()) {
            this._width = Math.max(this._width, component.x + component.width + this._padding)
            this._height = Math.max(this._height, component.y + component.height + this._padding)
        }

        this._fitChildrenWidthToParent()
    }

    _resolveValue(name) {
        return resolveValue(name, this.data.kind)
    }

    _getIsArrangedVertically() {
        if (this._resolveValue('arrange') === 'vertically') {
            return true
        }
        return false
    }

    _getIsArrangedHorizontally() {
        if (this._resolveValue('arrange') === 'horizontally') {
            return true
        }
        return false
    }

    _getIsArrangedPack() {
        if (this._resolveValue('arrange') === 'pack') {
            return true
        }
        return false
    }

    _arrangeChildrenHorizontally() {
        var i = this._paddingLeft
        for (var child of this.visibleChildren) {
            child._x = i
            child._y = this._headerHeight + this._padding
            i += child.width + this._padding
        }
    }

    _arrangeChildrenVertically() {
        var i = this._headerHeight + this._padding
        for (var child of this.visibleChildren) {
            child._x = this._paddingLeft
            child._y = i
            i += child.height + this._padding
        }
    }

    _arrangeChildrenPack() {
        var packer = new GrowingPacker()
        var blocks = this.visibleChildren.map(x => ({
            w: x.width + this._padding,
            h: x.height + this._padding,
            item: x
        }))
        blocks = _.orderBy(blocks, x => Math.max(x.h, x.w), 'desc')
        // blocks.sort(function(a,b) { return (Math.max(b.h, b.w) < Math.max(a.h, a.w)); }); // sort inputs for best results
        packer.fit(blocks)

        for (var block of blocks) {
            if (block.fit) {
                block.item._x = this._paddingLeft + block.fit.x
                block.item._y = this._headerHeight + this._padding + block.fit.y
            } else {
                console.log('DOES NOT FIT')
            }
        }
    }

    _fitChildrenWidthToParent() {
        if (!this._getIsArrangedVertically()) {
            return
        }

        for (var child of this.visibleChildren) {
            child._width = this._width - this._paddingLeft - this._padding
            child._fitChildrenWidthToParent()
        }
    }

    _getInnerCompontents() {
        return this.visibleChildren
    }

    calculateAbsolutePos() {
        if (this._parent) {
            this._absX = this._parent.absX + this._x
            this._absY = this._parent.absY + this._y
        } else {
            this._absX = this._x
            this._absY = this._y
        }
        for (var child of this.visibleChildren) {
            child.calculateAbsolutePos()
        }
    }

    autoexpand() {
        var nodes = []

        let recurse = function (node) {

            if (!node.view._existingNodeIds[node.id]) {
                node.view._existingNodeIds[node.id] = true
                if (node._resolveValue('expanded')) {
                    node.isExpanded = true
                }
            }

            for (var child of node._children) {
                recurse(child)
            }
        }

        recurse(this)

        return nodes
    }

    extract() {
        var nodes = []

        let recurse = function (node) {
            nodes.push(node)
            for (var child of node.visibleChildren) {
                recurse(child)
            }
        }

        recurse(this)

        return nodes
    }

    _setupTheme() {
        var x = VISUAL_NODE_COLOR_TABLE[this.depth % VISUAL_NODE_COLOR_TABLE.length]
        this._headerFillColor = x
        this._headerBgFillColor = '#35373E'
        this._bgFillColor = '#252526'
        this._strokeColor = '#35373E'

        this._selectedHeaderFillColor = '#FCBD3F'
        this._selectedBgFillColor = '#43454D'
        this._selectedStrokeColor = this._selectedHeaderFillColor

    }

}


/*
 *
 */
class BaseVisualNodeHeader {
    constructor(node, headerName, flavor) {
        this._node = node
        this._headerName = headerName
        this._flavor = flavor
    }

    get view() {
        return this._node.view;
    }

    get node() {
        return this._node
    }

    get headerName() {
        return this._headerName
    }

    get header() {
        return this.node.getHeader(this.headerName)
    }

    x() {
        return this.node.getHeaderX(this.headerName, this._flavor)
    }

    y() {
        return this.node.getHeaderY(this.headerName, this._flavor)
    }

    translateTransform() {
        return 'translate(' + this.x() + ',' + this.y() + ')';
    }

    width() {
        var header = this.header
        if (!header) {
            // TODO: Error
            return 0
        }
        if (this._flavor) {
            return header[this._flavor].width
        }
        return header.width
    }

    height() {
        var header = this.header
        if (!header) {
            // TODO: Error
            return 0
        }
        if (this._flavor) {
            return header[this._flavor].height
        }
        return header.height
    }

    transform() {
        return 'translate(' +
            this.node.getHeaderX(this.headerName, this._flavor) + ',' +
            this.node.getHeaderY(this.headerName, this._flavor) + ')'
    }
}

/*
 *
 */
class VisualNodeText extends BaseVisualNodeHeader {
    constructor(node, headerName, flavor) {
        super(node, headerName, flavor)
    }

    text() {
        var header = this.header
        if (!header) {
            // TODO: Error
            return ''
        }
        return header.text
    }
}

/*
 *
 */
class VisualNodeSeverity extends BaseVisualNodeHeader {
    constructor(node, headerName, flavor, fill) {
        super(node, headerName, flavor)
        this._fill = fill
    }

    get fill() {
        return this._fill
    }
}

/*
 *
 */
class VisualNodeHeaderFlag extends BaseVisualNodeHeader {
    constructor(node, flag) {
        super(node, 'flag-' + flag, null)

        this._flag = flag
    }

    get flag() {
        return this._flag
    }

    get imgSrc() {
        var header = this.header
        if (!header) {
            // TODO: Error
            return ''
        }
        return '/img/flags/' + header.icon + '.svg'
    }
}

/*
 *
 */

class VisualNodeHeaderExpander extends BaseVisualNodeHeader {
    constructor(node, headerName) {
        super(node, headerName, null)
    }

    get imgSrc() {
        if (this.node.isExpanded) {
            return '/img/collapse.svg'
        } else {
            return '/img/expand.svg'
        }
    }
}

/*
 *
 */
const VISUAL_NODE_COLOR_TABLE = [
    '#7C90BF',
    '#F58D61',
    '#66C2A5',
    '#80B1D2',
    '#A6D853',
    '#E2A78E',
    '#E789C2',
    '#BDB9DA',
    '#BD7637',
    '#D23AEE',
    '#8331CB',
    '#BBBBBB',
]

/*
 *
 */
const SEVERITY_BG_COLOR_ERROR = 'red'
const SEVERITY_BG_COLOR_WARN = '#f58142'


const NODE_RENDER_METADATA = {
    default: {
        arrange: 'vertically',
        padding: 15,
        expanded: false
    },
    per_kind: {
        root: {
            arrange: 'horizontally',
            expanded: true
        },
        ns: {
            expanded: true,
        },
        app: {},
        cont: {
            arrange: 'pack',
        },
        replicaset: {
            arrange: 'pack',
        },
        raw: {}
    }
}

function resolveValue(name, kind) {
    var valuesDefault = NODE_RENDER_METADATA.default
    var valuesKind = NODE_RENDER_METADATA.per_kind[kind]

    var values = _.cloneDeep(valuesDefault)
    if (valuesKind) {
        values = _.defaults(valuesKind, values)
    }

    return values[name]
}

export default VisualNode
