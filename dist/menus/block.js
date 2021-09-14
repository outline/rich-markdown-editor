"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const outline_icons_1 = require("outline-icons");
const SSR = typeof window === "undefined";
const isMac = !SSR && window.navigator.platform === "MacIntel";
const mod = isMac ? "⌘" : "ctrl";
function blockMenuItems(dictionary) {
    return [
        {
            name: "container_query_block",
            title: dictionary.queryBlock,
            icon: outline_icons_1.CodeIcon,
            keywords: "query sql script runs results",
            shortcut: ";;;",
        },
        {
            name: "separator",
        },
        {
            name: "heading",
            title: dictionary.h1,
            keywords: "h1 heading1 title",
            icon: outline_icons_1.Heading1Icon,
            shortcut: "^ ⇧ 1",
            attrs: { level: 1 },
        },
        {
            name: "heading",
            title: dictionary.h2,
            keywords: "h2 heading2",
            icon: outline_icons_1.Heading2Icon,
            shortcut: "^ ⇧ 2",
            attrs: { level: 2 },
        },
        {
            name: "heading",
            title: dictionary.h3,
            keywords: "h3 heading3",
            icon: outline_icons_1.Heading3Icon,
            shortcut: "^ ⇧ 3",
            attrs: { level: 3 },
        },
        {
            name: "separator",
        },
        {
            name: "checkbox_list",
            title: dictionary.checkboxList,
            icon: outline_icons_1.TodoListIcon,
            keywords: "checklist checkbox task",
            shortcut: "^ ⇧ 7",
        },
        {
            name: "bullet_list",
            title: dictionary.bulletList,
            icon: outline_icons_1.BulletedListIcon,
            shortcut: "^ ⇧ 8",
        },
        {
            name: "ordered_list",
            title: dictionary.orderedList,
            icon: outline_icons_1.OrderedListIcon,
            shortcut: "^ ⇧ 9",
        },
        {
            name: "separator",
        },
        {
            name: "table",
            title: dictionary.table,
            icon: outline_icons_1.TableIcon,
            attrs: { rowsCount: 3, colsCount: 3 },
        },
        {
            name: "blockquote",
            title: dictionary.quote,
            icon: outline_icons_1.BlockQuoteIcon,
            shortcut: `${mod} ]`,
        },
        {
            name: "code_block",
            title: dictionary.codeBlock,
            icon: outline_icons_1.CodeIcon,
            shortcut: "^ ⇧ \\",
            keywords: "script",
        },
        {
            name: "hr",
            title: dictionary.hr,
            icon: outline_icons_1.HorizontalRuleIcon,
            shortcut: `${mod} _`,
            keywords: "horizontal rule break line",
        },
        {
            name: "hr",
            title: dictionary.pageBreak,
            icon: outline_icons_1.PageBreakIcon,
            keywords: "page print break line",
            attrs: { markup: "***" },
        },
        {
            name: "image",
            title: dictionary.image,
            icon: outline_icons_1.ImageIcon,
            keywords: "picture photo",
        },
        {
            name: "link",
            title: dictionary.link,
            icon: outline_icons_1.LinkIcon,
            shortcut: `${mod} k`,
            keywords: "link url uri href",
        },
        {
            name: "separator",
        },
        {
            name: "container_notice",
            title: dictionary.infoNotice,
            icon: outline_icons_1.InfoIcon,
            keywords: "container_notice card information",
            attrs: { style: "info" },
        },
        {
            name: "container_notice",
            title: dictionary.warningNotice,
            icon: outline_icons_1.WarningIcon,
            keywords: "container_notice card error",
            attrs: { style: "warning" },
        },
        {
            name: "container_notice",
            title: dictionary.tipNotice,
            icon: outline_icons_1.StarredIcon,
            keywords: "container_notice card suggestion",
            attrs: { style: "tip" },
        },
    ];
}
exports.default = blockMenuItems;
//# sourceMappingURL=block.js.map