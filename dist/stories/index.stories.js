"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dark = exports.Focused = exports.Images = exports.Placeholder = exports.Persisted = exports.ReadOnlyWriteCheckboxes = exports.Checkboxes = exports.MaxLength = exports.ReadOnly = exports.Notices = exports.Code = exports.Marks = exports.Tables = exports.Blockquotes = exports.Lists = exports.Headings = exports.TemplateDoc = exports.Default = void 0;
const index_1 = __importDefault(require("./index"));
const lodash_1 = require("lodash");
const react_1 = __importDefault(require("react"));
exports.default = {
    title: "Editor",
    component: index_1.default,
    argTypes: {
        onSave: { action: "save" },
        onCancel: { action: "cancel" },
        onClickHashtag: { action: "hashtag clicked" },
        onClickLink: { action: "link clicked" },
        onHoverLink: { action: "link hovered" },
        onShowToast: { action: "toast" },
        onFocus: { action: "focused" },
        onBlur: { action: "blurred" },
    },
};
const Template = args => react_1.default.createElement(index_1.default, Object.assign({}, args));
exports.Default = Template.bind({});
exports.Default.args = {
    defaultValue: `# Welcome

Just an easy to use **Markdown** editor with \`slash commands\``,
};
exports.TemplateDoc = Template.bind({});
exports.TemplateDoc.args = {
    template: true,
    defaultValue: `# Template

This document acts as a "template document", it's possible to insert placeholder marks that can be filled in later by others in a non-template document.

\\
!!This is a template placeholder!!`,
};
exports.Headings = Template.bind({});
exports.Headings.args = {
    defaultValue: `# Heading 1

## Heading 2

### Heading 3

#### Heading 4`,
};
exports.Lists = Template.bind({});
exports.Lists.args = {
    defaultValue: `# Lists

- An
- Unordered
- List

\\
1. An
1. Ordered
1. List`,
};
exports.Blockquotes = Template.bind({});
exports.Blockquotes.args = {
    defaultValue: `# Block quotes

> Quotes are another way to callout text within a larger document
> They are often used to incorrectly attribute words to historical figures`,
};
exports.Tables = Template.bind({});
exports.Tables.args = {
    defaultValue: `# Tables

Simple tables with alignment and row/col editing are supported, they can be inserted from the slash menu

| Editor      | Rank | React | Collaborative |
|-------------|------|-------|--------------:|
| Prosemirror | A    |   No  |           Yes |
| Slate       | B    |  Yes  |            No |
| CKEdit      | C    |   No  |           Yes |
`,
};
exports.Marks = Template.bind({});
exports.Marks.args = {
    defaultValue: `This document shows the variety of marks available, most can be accessed through the formatting menu by selecting text or by typing out the Markdown manually.

\\
**bold**
_italic_
~~strikethrough~~
__underline__
==highlighted==
\`inline code\`
!!placeholder!!
[a link](http://www.getoutline.com)
`,
};
exports.Code = Template.bind({});
exports.Code.args = {
    defaultValue: `# Code

\`\`\`html
<html>
  <p class="content">Simple code blocks are supported</html>
</html>
\`\`\`
`,
};
exports.Notices = Template.bind({});
exports.Notices.args = {
    defaultValue: `# Notices

There are three types of editable notice blocks that can be used to callout information:

\\
:::info
Informational
:::

:::tip
Tip
:::

:::warning
Warning
:::
`,
};
exports.ReadOnly = Template.bind({});
exports.ReadOnly.args = {
    readOnly: true,
    defaultValue: `# Read Only
  
The content of this editor cannot be edited`,
};
exports.MaxLength = Template.bind({});
exports.MaxLength.args = {
    maxLength: 100,
    defaultValue: `This document has a max length of 100 characters. Once reached typing is prevented`,
};
exports.Checkboxes = Template.bind({});
exports.Checkboxes.args = {
    defaultValue: `
- [x] done
- [ ] todo`,
};
exports.ReadOnlyWriteCheckboxes = Template.bind({});
exports.ReadOnlyWriteCheckboxes.args = {
    readOnly: true,
    readOnlyWriteCheckboxes: true,
    defaultValue: `A read-only editor with the exception that checkboxes remain toggleable, like GitHub

\\
- [x] done
- [ ] todo`,
};
exports.Persisted = Template.bind({});
exports.Persisted.args = {
    defaultValue: localStorage.getItem("saved") ||
        `# Persisted
  
The contents of this editor are persisted to local storage on change (edit and reload)`,
    onChange: lodash_1.debounce(value => {
        const text = value();
        localStorage.setItem("saved", text);
    }, 250),
};
exports.Placeholder = Template.bind({});
exports.Placeholder.args = {
    defaultValue: "",
    placeholder: "This is a custom placeholder…",
};
exports.Images = Template.bind({});
exports.Images.args = {
    defaultValue: `# Images
![A caption](https://upload.wikimedia.org/wikipedia/commons/0/06/Davide-ragusa-gcDwzUGuUoI-unsplash.jpg)`,
};
exports.Focused = Template.bind({});
exports.Focused.args = {
    autoFocus: true,
    defaultValue: `# Focused
  
  This editor starts in focus`,
};
exports.Dark = Template.bind({});
exports.Dark.args = {
    dark: true,
    defaultValue: `# Dark

There's a customizable dark theme too`,
};
//# sourceMappingURL=index.stories.js.map