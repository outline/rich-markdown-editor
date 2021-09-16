"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const React = __importStar(require("react"));
const memoize_1 = __importDefault(require("lodash/memoize"));
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_dropcursor_1 = require("prosemirror-dropcursor");
const prosemirror_gapcursor_1 = require("prosemirror-gapcursor");
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_model_1 = require("prosemirror-model");
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const prosemirror_keymap_1 = require("prosemirror-keymap");
const prosemirror_commands_1 = require("prosemirror-commands");
const prosemirror_utils_1 = require("prosemirror-utils");
const styled_components_1 = __importStar(require("styled-components"));
const theme_1 = require("./theme");
const dictionary_1 = __importDefault(require("./dictionary"));
const Flex_1 = __importDefault(require("./components/Flex"));
const SelectionToolbar_1 = __importDefault(require("./components/SelectionToolbar"));
const BlockMenu_1 = __importDefault(require("./components/BlockMenu"));
const LinkToolbar_1 = __importDefault(require("./components/LinkToolbar"));
const Tooltip_1 = __importDefault(require("./components/Tooltip"));
const ExtensionManager_1 = __importDefault(require("./lib/ExtensionManager"));
const ComponentView_1 = __importDefault(require("./lib/ComponentView"));
const headingToSlug_1 = __importDefault(require("./lib/headingToSlug"));
const Doc_1 = __importDefault(require("./nodes/Doc"));
const Text_1 = __importDefault(require("./nodes/Text"));
const Blockquote_1 = __importDefault(require("./nodes/Blockquote"));
const BulletList_1 = __importDefault(require("./nodes/BulletList"));
const CodeBlock_1 = __importDefault(require("./nodes/CodeBlock"));
const CodeFence_1 = __importDefault(require("./nodes/CodeFence"));
const CheckboxList_1 = __importDefault(require("./nodes/CheckboxList"));
const CheckboxItem_1 = __importDefault(require("./nodes/CheckboxItem"));
const Embed_1 = __importDefault(require("./nodes/Embed"));
const HardBreak_1 = __importDefault(require("./nodes/HardBreak"));
const Heading_1 = __importDefault(require("./nodes/Heading"));
const HorizontalRule_1 = __importDefault(require("./nodes/HorizontalRule"));
const Image_1 = __importDefault(require("./nodes/Image"));
const ListItem_1 = __importDefault(require("./nodes/ListItem"));
const Notice_1 = __importDefault(require("./nodes/Notice"));
const OrderedList_1 = __importDefault(require("./nodes/OrderedList"));
const Paragraph_1 = __importDefault(require("./nodes/Paragraph"));
const Table_1 = __importDefault(require("./nodes/Table"));
const TableCell_1 = __importDefault(require("./nodes/TableCell"));
const TableHeadCell_1 = __importDefault(require("./nodes/TableHeadCell"));
const TableRow_1 = __importDefault(require("./nodes/TableRow"));
const Bold_1 = __importDefault(require("./marks/Bold"));
const Code_1 = __importDefault(require("./marks/Code"));
const Highlight_1 = __importDefault(require("./marks/Highlight"));
const Italic_1 = __importDefault(require("./marks/Italic"));
const Link_1 = __importDefault(require("./marks/Link"));
const Strikethrough_1 = __importDefault(require("./marks/Strikethrough"));
const Placeholder_1 = __importDefault(require("./marks/Placeholder"));
const Underline_1 = __importDefault(require("./marks/Underline"));
const BlockMenuTrigger_1 = __importDefault(require("./plugins/BlockMenuTrigger"));
const Folding_1 = __importDefault(require("./plugins/Folding"));
const History_1 = __importDefault(require("./plugins/History"));
const Keys_1 = __importDefault(require("./plugins/Keys"));
const MaxLength_1 = __importDefault(require("./plugins/MaxLength"));
const Placeholder_2 = __importDefault(require("./plugins/Placeholder"));
const SmartText_1 = __importDefault(require("./plugins/SmartText"));
const TrailingNode_1 = __importDefault(require("./plugins/TrailingNode"));
const MarkdownPaste_1 = __importDefault(require("./plugins/MarkdownPaste"));
var server_1 = require("./server");
Object.defineProperty(exports, "schema", { enumerable: true, get: function () { return server_1.schema; } });
Object.defineProperty(exports, "parser", { enumerable: true, get: function () { return server_1.parser; } });
Object.defineProperty(exports, "serializer", { enumerable: true, get: function () { return server_1.serializer; } });
Object.defineProperty(exports, "renderToHtml", { enumerable: true, get: function () { return server_1.renderToHtml; } });
var Extension_1 = require("./lib/Extension");
Object.defineProperty(exports, "Extension", { enumerable: true, get: function () { return Extension_1.default; } });
exports.theme = theme_1.light;
class RichMarkdownEditor extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isRTL: false,
            isEditorFocused: false,
            selectionMenuOpen: false,
            blockMenuOpen: false,
            linkMenuOpen: false,
            blockMenuSearch: "",
        };
        this.calculateDir = () => {
            if (!this.element)
                return;
            const isRTL = this.props.dir === "rtl" ||
                getComputedStyle(this.element).direction === "rtl";
            if (this.state.isRTL !== isRTL) {
                this.setState({ isRTL });
            }
        };
        this.value = () => {
            return this.serializer.serialize(this.view.state.doc);
        };
        this.handleChange = () => {
            if (!this.props.onChange)
                return;
            this.props.onChange(() => {
                return this.value();
            });
        };
        this.handleSave = () => {
            const { onSave } = this.props;
            if (onSave) {
                onSave({ done: false });
            }
        };
        this.handleSaveAndExit = () => {
            const { onSave } = this.props;
            if (onSave) {
                onSave({ done: true });
            }
        };
        this.handleEditorBlur = () => {
            this.setState({ isEditorFocused: false });
        };
        this.handleEditorFocus = () => {
            this.setState({ isEditorFocused: true });
        };
        this.handleOpenSelectionMenu = () => {
            this.setState({ blockMenuOpen: false, selectionMenuOpen: true });
        };
        this.handleCloseSelectionMenu = () => {
            this.setState({ selectionMenuOpen: false });
        };
        this.handleOpenLinkMenu = () => {
            this.setState({ blockMenuOpen: false, linkMenuOpen: true });
        };
        this.handleCloseLinkMenu = () => {
            this.setState({ linkMenuOpen: false });
        };
        this.handleOpenBlockMenu = (search) => {
            this.setState({ blockMenuOpen: true, blockMenuSearch: search });
        };
        this.handleCloseBlockMenu = () => {
            if (!this.state.blockMenuOpen)
                return;
            this.setState({ blockMenuOpen: false });
        };
        this.handleSelectRow = (index, state) => {
            this.view.dispatch(prosemirror_utils_1.selectRow(index)(state.tr));
        };
        this.handleSelectColumn = (index, state) => {
            this.view.dispatch(prosemirror_utils_1.selectColumn(index)(state.tr));
        };
        this.handleSelectTable = (state) => {
            this.view.dispatch(prosemirror_utils_1.selectTable(state.tr));
        };
        this.focusAtStart = () => {
            const selection = prosemirror_state_1.Selection.atStart(this.view.state.doc);
            const transaction = this.view.state.tr.setSelection(selection);
            this.view.dispatch(transaction);
            this.view.focus();
        };
        this.focusAtEnd = () => {
            const selection = prosemirror_state_1.Selection.atEnd(this.view.state.doc);
            const transaction = this.view.state.tr.setSelection(selection);
            this.view.dispatch(transaction);
            this.view.focus();
        };
        this.getHeadings = () => {
            const headings = [];
            const previouslySeen = {};
            this.view.state.doc.forEach((node) => {
                if (node.type.name === "heading") {
                    const slug = headingToSlug_1.default(node);
                    let id = slug;
                    if (previouslySeen[slug] > 0) {
                        id = headingToSlug_1.default(node, previouslySeen[slug]);
                    }
                    previouslySeen[slug] =
                        previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;
                    headings.push({
                        title: node.textContent,
                        level: node.attrs.level,
                        id,
                    });
                }
            });
            return headings;
        };
        this.theme = () => {
            return this.props.theme || (this.props.dark ? theme_1.dark : theme_1.light);
        };
        this.dictionary = memoize_1.default((providedDictionary) => {
            return Object.assign(Object.assign({}, dictionary_1.default), providedDictionary);
        });
    }
    componentDidMount() {
        this.init();
        if (this.props.scrollTo) {
            this.scrollToAnchor(this.props.scrollTo);
        }
        const { highlightTerm } = this.props;
        if (highlightTerm) {
            setTimeout(() => {
                this.scrollToTerm(highlightTerm);
            }, 500);
        }
        this.calculateDir();
        if (this.props.readOnly)
            return;
        if (this.props.autoFocus) {
            this.focusAtEnd();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.value && prevProps.value !== this.props.value) {
            const newState = this.createState(this.props.value);
            this.view.updateState(newState);
        }
        if (prevProps.readOnly !== this.props.readOnly) {
            this.view.update(Object.assign(Object.assign({}, this.view.props), { editable: () => !this.props.readOnly }));
        }
        if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
            this.scrollToAnchor(this.props.scrollTo);
        }
        if (this.props.highlightTerm &&
            this.props.highlightTerm !== prevProps.highlightTerm) {
            this.scrollToTerm(this.props.highlightTerm);
        }
        if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
            this.focusAtEnd();
        }
        if (prevProps.dir !== this.props.dir) {
            this.calculateDir();
        }
        if (!this.isBlurred &&
            !this.state.isEditorFocused &&
            !this.state.blockMenuOpen &&
            !this.state.linkMenuOpen &&
            !this.state.selectionMenuOpen) {
            this.isBlurred = true;
            if (this.props.onBlur) {
                this.props.onBlur();
            }
        }
        if (this.isBlurred &&
            (this.state.isEditorFocused ||
                this.state.blockMenuOpen ||
                this.state.linkMenuOpen ||
                this.state.selectionMenuOpen)) {
            this.isBlurred = false;
            if (this.props.onFocus) {
                this.props.onFocus();
            }
        }
    }
    init() {
        this.extensions = this.createExtensions();
        this.nodes = this.createNodes();
        this.marks = this.createMarks();
        this.schema = this.createSchema();
        this.plugins = this.createPlugins();
        this.keymaps = this.createKeymaps();
        this.serializer = this.createSerializer();
        this.parser = this.createParser();
        this.inputRules = this.createInputRules();
        this.nodeViews = this.createNodeViews();
        this.view = this.createView();
        this.commands = this.createCommands();
    }
    createExtensions() {
        const dictionary = this.dictionary(this.props.dictionary);
        return new ExtensionManager_1.default([
            ...[
                new Doc_1.default(),
                new Text_1.default(),
                new HardBreak_1.default(),
                new Paragraph_1.default(),
                new Blockquote_1.default(),
                new CodeBlock_1.default({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                }),
                new CodeFence_1.default({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                }),
                new CheckboxList_1.default(),
                new CheckboxItem_1.default(),
                new BulletList_1.default(),
                new Embed_1.default(),
                new ListItem_1.default(),
                new Notice_1.default({
                    dictionary,
                }),
                new Heading_1.default({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                    offset: this.props.headingsOffset,
                }),
                new HorizontalRule_1.default(),
                new Image_1.default({
                    dictionary,
                    uploadImage: this.props.uploadImage,
                    onImageUploadStart: this.props.onImageUploadStart,
                    onImageUploadStop: this.props.onImageUploadStop,
                    onShowToast: this.props.onShowToast,
                }),
                new Table_1.default(),
                new TableCell_1.default({
                    onSelectTable: this.handleSelectTable,
                    onSelectRow: this.handleSelectRow,
                }),
                new TableHeadCell_1.default({
                    onSelectColumn: this.handleSelectColumn,
                }),
                new TableRow_1.default(),
                new Bold_1.default(),
                new Code_1.default(),
                new Highlight_1.default(),
                new Italic_1.default(),
                new Placeholder_1.default(),
                new Underline_1.default(),
                new Link_1.default({
                    onKeyboardShortcut: this.props.onOpenSearchModal,
                    onClickLink: this.props.onClickLink,
                    onClickHashtag: this.props.onClickHashtag,
                    onHoverLink: this.props.onHoverLink,
                }),
                new Strikethrough_1.default(),
                new OrderedList_1.default(),
                new History_1.default(),
                new Folding_1.default(),
                new SmartText_1.default(),
                new TrailingNode_1.default(),
                new MarkdownPaste_1.default(),
                new Keys_1.default({
                    onBlur: this.handleEditorBlur,
                    onFocus: this.handleEditorFocus,
                    onSave: this.handleSave,
                    onSaveAndExit: this.handleSaveAndExit,
                    onCancel: this.props.onCancel,
                }),
                new BlockMenuTrigger_1.default({
                    dictionary,
                    onOpen: this.handleOpenBlockMenu,
                    onClose: this.handleCloseBlockMenu,
                }),
                new Placeholder_2.default({
                    placeholder: this.props.placeholder,
                }),
                new MaxLength_1.default({
                    maxLength: this.props.maxLength,
                }),
            ].filter((extension) => {
                if (this.props.disableExtensions) {
                    return !this.props.disableExtensions.includes(extension.name);
                }
                return true;
            }),
            ...this.props.extensions,
        ], this);
    }
    createPlugins() {
        return this.extensions.plugins;
    }
    createKeymaps() {
        return this.extensions.keymaps({
            schema: this.schema,
        });
    }
    createInputRules() {
        return this.extensions.inputRules({
            schema: this.schema,
        });
    }
    createNodeViews() {
        return this.extensions.extensions
            .filter((extension) => extension.component)
            .reduce((nodeViews, extension) => {
            const nodeView = (node, view, getPos, decorations) => {
                return new ComponentView_1.default(extension.component, {
                    editor: this,
                    extension,
                    node,
                    view,
                    getPos,
                    decorations,
                });
            };
            return Object.assign(Object.assign({}, nodeViews), { [extension.name]: nodeView });
        }, {});
    }
    createCommands() {
        return this.extensions.commands({
            schema: this.schema,
            view: this.view,
        });
    }
    createNodes() {
        return this.extensions.nodes;
    }
    createMarks() {
        return this.extensions.marks;
    }
    createSchema() {
        return new prosemirror_model_1.Schema({
            nodes: this.nodes,
            marks: this.marks,
        });
    }
    createSerializer() {
        return this.extensions.serializer();
    }
    createParser() {
        return this.extensions.parser({
            schema: this.schema,
        });
    }
    createState(value) {
        const doc = this.createDocument(value || this.props.defaultValue);
        return prosemirror_state_1.EditorState.create({
            schema: this.schema,
            doc,
            plugins: [
                ...this.plugins,
                ...this.keymaps,
                prosemirror_dropcursor_1.dropCursor({ color: this.theme().cursor }),
                prosemirror_gapcursor_1.gapCursor(),
                prosemirror_inputrules_1.inputRules({
                    rules: this.inputRules,
                }),
                prosemirror_keymap_1.keymap(prosemirror_commands_1.baseKeymap),
            ],
        });
    }
    createDocument(content) {
        return this.parser.parse(content);
    }
    createView() {
        if (!this.element) {
            throw new Error("createView called before ref available");
        }
        const isEditingCheckbox = (tr) => {
            return tr.steps.some((step) => {
                var _a, _b, _c;
                return ((_c = (_b = (_a = step.slice) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.firstChild) === null || _c === void 0 ? void 0 : _c.type.name) ===
                    this.schema.nodes.checkbox_item.name;
            });
        };
        const self = this;
        const view = new prosemirror_view_1.EditorView(this.element, {
            state: this.createState(this.props.value),
            editable: () => !this.props.readOnly,
            nodeViews: this.nodeViews,
            handleDOMEvents: this.props.handleDOMEvents,
            transformPasted: this.props.transformPasted,
            dispatchTransaction: function (transaction) {
                const { state, transactions } = this.state.applyTransaction(transaction);
                this.updateState(state);
                if (transactions.some((tr) => tr.docChanged) &&
                    (!self.props.readOnly ||
                        (self.props.readOnlyWriteCheckboxes &&
                            transactions.some(isEditingCheckbox)))) {
                    self.handleChange();
                }
                self.calculateDir();
                self.forceUpdate();
            },
        });
        view.dom.setAttribute("role", "textbox");
        return view;
    }
    scrollToAnchor(hash) {
        if (!hash)
            return;
        try {
            const element = document.querySelector(hash);
            if (element)
                element.scrollIntoView({ behavior: "smooth" });
        }
        catch (err) {
            console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
        }
    }
    scrollToTerm(term) {
        var _a;
        if (!term || !this.props.id)
            return;
        try {
            const elementList = document.querySelectorAll(`#${this.props.id} > div > div > *`);
            let firstFound, nodeIndex, startSelection;
            for (let i = 0; i < elementList.length; i++) {
                const firstIndex = (_a = elementList[i].textContent) === null || _a === void 0 ? void 0 : _a.search(new RegExp(term, "i"));
                if (firstIndex !== undefined && firstIndex > -1) {
                    firstFound = elementList[i];
                    nodeIndex = i;
                    startSelection = firstIndex;
                    break;
                }
            }
            if (firstFound) {
                firstFound.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                    this.view.focus();
                    this.view.dispatch(this.view.state.tr.setSelection(prosemirror_state_1.TextSelection.create(this.view.state.tr.doc, this.view.posAtDOM(firstFound, 0), this.view.posAtDOM(firstFound, 0) +
                        this.view.state.doc.content.child(nodeIndex).nodeSize -
                        2)));
                }, 500);
            }
        }
        catch (err) {
            console.warn(`Attempted to scroll to invalid term: ${term}`, err);
        }
    }
    render() {
        const { id, dir, readOnly, readOnlyWriteCheckboxes, style, tooltip, className, onKeyDown, } = this.props;
        const { isRTL } = this.state;
        const dictionary = this.dictionary(this.props.dictionary);
        return (React.createElement(Flex_1.default, { id: id, onKeyDown: onKeyDown, style: style, className: className, align: "flex-start", justify: "center", dir: dir, column: true },
            React.createElement(styled_components_1.ThemeProvider, { theme: this.theme() },
                React.createElement(React.Fragment, null,
                    React.createElement(StyledEditor, { dir: dir, rtl: isRTL, readOnly: readOnly, readOnlyWriteCheckboxes: readOnlyWriteCheckboxes, ref: (ref) => (this.element = ref) }),
                    !readOnly && this.view && (React.createElement(React.Fragment, null,
                        React.createElement(SelectionToolbar_1.default, { view: this.view, dictionary: dictionary, commands: this.commands, rtl: isRTL, isTemplate: this.props.template === true, onOpen: this.handleOpenSelectionMenu, onClose: this.handleCloseSelectionMenu, onSearchLink: this.props.onSearchLink, onClickLink: this.props.onClickLink, onCreateLink: this.props.onCreateLink, tooltip: tooltip }),
                        React.createElement(LinkToolbar_1.default, { view: this.view, dictionary: dictionary, isActive: this.state.linkMenuOpen, onCreateLink: this.props.onCreateLink, onSearchLink: this.props.onSearchLink, onClickLink: this.props.onClickLink, onShowToast: this.props.onShowToast, onClose: this.handleCloseLinkMenu, tooltip: tooltip }),
                        React.createElement(BlockMenu_1.default, { view: this.view, commands: this.commands, dictionary: dictionary, rtl: isRTL, isActive: this.state.blockMenuOpen, search: this.state.blockMenuSearch, onClose: this.handleCloseBlockMenu, uploadImage: this.props.uploadImage, onLinkToolbarOpen: this.handleOpenLinkMenu, onImageUploadStart: this.props.onImageUploadStart, onImageUploadStop: this.props.onImageUploadStop, onShowToast: this.props.onShowToast, embeds: this.props.embeds })))))));
    }
}
RichMarkdownEditor.defaultProps = {
    defaultValue: "",
    dir: "auto",
    placeholder: "Write something nice…",
    onImageUploadStart: () => {
    },
    onImageUploadStop: () => {
    },
    onClickLink: (href) => {
        window.open(href, "_blank");
    },
    embeds: [],
    extensions: [],
    tooltip: Tooltip_1.default,
};
const StyledEditor = styled_components_1.default("div") `
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.background};
  font-family: ${(props) => props.theme.fontFamily};
  font-weight: ${(props) => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: pre-wrap;
    white-space: break-spaces;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
  }

  pre {
    white-space: pre-wrap;
  }

  li {
    position: relative;
  }

  .image {
    text-align: center;
    max-width: 100%;
    clear: both;

    img {
      pointer-events: ${(props) => (props.readOnly ? "initial" : "none")};
      display: inline-block;
      max-width: 100%;
      max-height: 75vh;
    }
  }

  .image.placeholder {
    position: relative;
    background: ${(props) => props.theme.background};
    margin-bottom: calc(28px + 1.2em);

    img {
      opacity: 0.5;
    }
  }

  .image-right-50 {
    float: right;
    width: 50%;
    margin-left: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  .image-left-50 {
    float: left;
    width: 50%;
    margin-right: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  .ProseMirror-hideselection *::selection {
    background: transparent;
  }
  .ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }
  .ProseMirror-hideselection {
    caret-color: transparent;
  }

  .ProseMirror-selectednode {
    outline: 2px solid
      ${(props) => (props.readOnly ? "transparent" : props.theme.selected)};
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: "";
    position: absolute;
    left: ${(props) => (props.rtl ? "-2px" : "-32px")};
    right: ${(props) => (props.rtl ? "-32px" : "-2px")};
    top: -2px;
    bottom: -2px;
    border: 2px solid ${(props) => props.theme.selected};
    pointer-events: none;
  }

  .ProseMirror[contenteditable="false"] {
    .caption {
      pointer-events: none;
    }
    .caption:empty {
      visibility: hidden;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1em 0 0.5em;
    font-weight: 500;
    cursor: default;

    &:not(.placeholder):before {
      display: ${(props) => (props.readOnly ? "none" : "inline-block")};
      font-family: ${(props) => props.theme.fontFamilyMono};
      color: ${(props) => props.theme.textSecondary};
      font-size: 13px;
      line-height: 0;
      margin-${(props) => (props.rtl ? "right" : "left")}: -24px;
      width: 24px;
    }

    &:hover,
    &:focus-within {
      .heading-actions {
        opacity: 1;
      }
    }
  }

  .heading-content {
    &:before {
      content: "​";
      display: inline;
    }
  }

  .heading-name {
    color: ${(props) => props.theme.text};

    &:hover {
      text-decoration: none;
    }
  }

  .folded-content:not(.placeholder) {
    display: none;
  }

  a:first-child {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
    }
  }

  h1:not(.placeholder):before {
    content: "H1";
  }
  h2:not(.placeholder):before {
    content: "H2";
  }
  h3:not(.placeholder):before {
    content: "H3";
  }
  h4:not(.placeholder):before {
    content: "H4";
  }
  h5:not(.placeholder):before {
    content: "H5";
  }
  h6:not(.placeholder):before {
    content: "H6";
  }

  .with-emoji {
    margin-${(props) => (props.rtl ? "right" : "left")}: -1em;
  }

  .heading-anchor,
  .heading-fold {
    display: inline-block;
    color: ${(props) => props.theme.text};
    opacity: .75;
    cursor: pointer;
    background: none;
    outline: none;
    border: 0;
    margin: 0;
    padding: 0;
    text-align: left;
    font-family: ${(props) => props.theme.fontFamilyMono};
    font-size: 14px;
    line-height: 0;
    width: 12px;
    height: 24px;

    &:focus,
    &:hover {
      opacity: 1;
    }
  }

  .heading-actions {
    opacity: 0;
    background: ${(props) => props.theme.background};
    margin-${(props) => (props.rtl ? "right" : "left")}: -26px;
    flex-direction: ${(props) => (props.rtl ? "row-reverse" : "row")};
    display: inline-flex;
    position: relative;
    top: -2px;
    width: 26px;
    height: 24px;

    &.collapsed {
      opacity: 1;
    }

    &.collapsed .heading-anchor {
      opacity: 0;
    }

    &.collapsed .heading-fold {
      opacity: 1;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    &:hover {
      .heading-anchor {
        opacity: 0.75 !important;
      }
      .heading-anchor:hover {
        opacity: 1 !important;
      }
    }
  }

  .heading-fold {
    display: inline-block;
    transform-origin: center;
    padding: 0;

    &.collapsed {
      transform: rotate(${(props) => (props.rtl ? "90deg" : "-90deg")});
      transition-delay: 0.1s;
      opacity: 1;
    }
  }

  .placeholder {
    &:before {
      display: block;
      content: ${(props) => (props.readOnly ? "" : "attr(data-empty-text)")};
      pointer-events: none;
      height: 0;
      color: ${(props) => props.theme.placeholder};
    }
  }

  @media print {
    .placeholder {
      display: none;
    }
  }

  .notice-block {
    display: flex;
    align-items: center;
    background: ${(props) => props.theme.noticeInfoBackground};
    color: ${(props) => props.theme.noticeInfoText};
    border-radius: 4px;
    padding: 8px 16px;
    margin: 8px 0;

    a {
      color: ${(props) => props.theme.noticeInfoText};
    }

    a:not(.heading-name) {
      text-decoration: underline;
    }
  }

  .notice-block .content {
    flex-grow: 1;
  }

  .notice-block .icon {
    width: 24px;
    height: 24px;
    align-self: flex-start;
    margin-${(props) => (props.rtl ? "left" : "right")}: 4px;
    position: relative;
    top: 1px;
  }

  .notice-block.tip {
    background: ${(props) => props.theme.noticeTipBackground};
    color: ${(props) => props.theme.noticeTipText};

    a {
      color: ${(props) => props.theme.noticeTipText};
    }
  }

  .notice-block.warning {
    background: ${(props) => props.theme.noticeWarningBackground};
    color: ${(props) => props.theme.noticeWarningText};

    a {
      color: ${(props) => props.theme.noticeWarningText};
    }
  }

  blockquote {
    margin: 0;
    padding-left: 1em;
    font-style: italic;
    overflow: hidden;
    position: relative;

    &:before {
      content: "";
      display: inline-block;
      width: 3px;
      border-radius: 1px;
      position: absolute;
      margin-${(props) => (props.rtl ? "right" : "left")}: -16px;
      top: 0;
      bottom: 0;
      background: ${(props) => props.theme.quote};
    }
  }

  b,
  strong {
    font-weight: 600;
  }

  .template-placeholder {
    color: ${(props) => props.theme.placeholder};
    border-bottom: 1px dotted ${(props) => props.theme.placeholder};
    border-radius: 2px;
    cursor: text;

    &:hover {
      border-bottom: 1px dotted
        ${(props) => props.readOnly ? props.theme.placeholder : props.theme.textSecondary};
    }
  }

  p {
    margin: 0;
  }

  a {
    color: ${(props) => props.theme.link};
  }

  a:hover {
    text-decoration: ${(props) => (props.readOnly ? "underline" : "none")};
  }

  ul,
  ol {
    margin: ${(props) => (props.rtl ? "0 -26px 0 0.1em" : "0 0.1em 0 -26px")};
    padding: ${(props) => (props.rtl ? "0 44px 0 0" : "0 0 0 44px")};

    ul,
    ol {
      margin-${(props) => (props.rtl ? "left" : "right")}: -24px;
    }
  }

  ol ol {
    list-style: lower-alpha;
  }

  ol ol ol {
    list-style: lower-roman;
  }

  ul.checkbox_list {
    list-style: none;
    padding: 0;
    margin: ${(props) => (props.rtl ? "0 -24px 0 0" : "0 0 0 -24px")};
  }

  ul li,
  ol li {
    position: relative;
    white-space: initial;

    p {
      white-space: pre-wrap;
    }

    > div {
      width: 100%;
    }
  }

  ul.checkbox_list li {
    display: flex;
    padding-${(props) => (props.rtl ? "right" : "left")}: 24px;
  }

  ul.checkbox_list li.checked > div > p {
    color: ${(props) => props.theme.textSecondary};
    text-decoration: line-through;
  }

  ul li::before,
  ol li::before {
    background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iOCIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iOCIgeT0iMTEiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+CjxyZWN0IHg9IjgiIHk9IjE1IiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iMTMiIHk9IjExIiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iMTUiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+Cjwvc3ZnPgo=");
    content: "";
    display: ${(props) => (props.readOnly ? "none" : "inline-block")};
    cursor: move;
    width: 24px;
    height: 24px;
    position: absolute;
    ${(props) => (props.rtl ? "right" : "left")}: -40px;
    top: 2px;
    opacity: 0;
    transition: opacity 200ms ease-in-out;
  }

  ul > li.hovering::before,
  ol li.hovering::before {
    opacity: 0.5;
  }

  ul li.ProseMirror-selectednode::after,
  ol li.ProseMirror-selectednode::after {
    display: none;
  }

  ul.checkbox_list li::before {
    ${(props) => (props.rtl ? "right" : "left")}: 0;
  }

  ul.checkbox_list li input {
    pointer-events: ${(props) => props.readOnly && !props.readOnlyWriteCheckboxes ? "none" : "initial"};
    opacity: ${(props) => props.readOnly && !props.readOnlyWriteCheckboxes ? 0.75 : 1};
    margin: ${(props) => (props.rtl ? "0.5em 0 0 0.5em" : "0.5em 0.5em 0 0")};
    width: 14px;
    height: 14px;
  }

  li p:first-child {
    margin: 0;
    word-break: break-word;
  }

  hr {
    position: relative;
    height: 1em;
    border: 0;
  }

  hr:before {
    content: "";
    display: block;
    position: absolute;
    border-top: 1px solid ${(props) => props.theme.horizontalRule};
    top: 0.5em;
    left: 0;
    right: 0;
  }

  hr.page-break {
    page-break-after: always;
  }

  hr.page-break:before {
    border-top: 1px dashed ${(props) => props.theme.horizontalRule};
  }

  code {
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.codeBorder};
    padding: 3px 4px;
    font-family: ${(props) => props.theme.fontFamilyMono};
    font-size: 85%;
  }

  mark {
    border-radius: 1px;
    color: ${(props) => props.theme.textHighlightForeground};
    background: ${(props) => props.theme.textHighlight};

    a {
      color: ${(props) => props.theme.textHighlightForeground};
    }
  }

  .code-block,
  .notice-block {
    position: relative;

    select,
    button {
      background: ${(props) => props.theme.blockToolbarBackground};
      color: ${(props) => props.theme.blockToolbarItem};
      border-width: 1px;
      font-size: 13px;
      display: none;
      position: absolute;
      border-radius: 4px;
      padding: 2px;
      z-index: 1;
      top: 4px;
    }

    &.code-block {
      select,
      button {
        right: 4px;
      }
    }

    &.notice-block {
      select,
      button {
        ${(props) => (props.rtl ? "left" : "right")}: 4px;
      }
    }

    button {
      padding: 2px 4px;
    }

    &:hover {
      select {
        display: ${(props) => (props.readOnly ? "none" : "inline")};
      }

      button {
        display: ${(props) => (props.readOnly ? "inline" : "none")};
      }
    }

    select:focus,
    select:active {
      display: inline;
    }
  }

  pre {
    display: block;
    overflow-x: auto;
    padding: 0.75em 1em;
    line-height: 1.4em;
    position: relative;
    background: ${(props) => props.theme.codeBackground};
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.codeBorder};

    -webkit-font-smoothing: initial;
    font-family: ${(props) => props.theme.fontFamilyMono};
    font-size: 13px;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    color: ${(props) => props.theme.code};
    margin: 0;

    code {
      font-size: 13px;
      background: none;
      padding: 0;
      border: 0;
    }
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${(props) => props.theme.codeComment};
  }

  .token.punctuation {
    color: ${(props) => props.theme.codePunctuation};
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.operator,
  .token.boolean,
  .token.number {
    color: ${(props) => props.theme.codeNumber};
  }

  .token.property {
    color: ${(props) => props.theme.codeProperty};
  }

  .token.tag {
    color: ${(props) => props.theme.codeTag};
  }

  .token.string {
    color: ${(props) => props.theme.codeString};
  }

  .token.selector {
    color: ${(props) => props.theme.codeSelector};
  }

  .token.attr-name {
    color: ${(props) => props.theme.codeAttr};
  }

  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${(props) => props.theme.codeEntity};
  }

  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit {
    color: ${(props) => props.theme.codeKeyword};
  }

  .token.function {
    color: ${(props) => props.theme.codeFunction};
  }

  .token.statement,
  .token.regex,
  .token.atrule {
    color: ${(props) => props.theme.codeStatement};
  }

  .token.placeholder,
  .token.variable {
    color: ${(props) => props.theme.codePlaceholder};
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted ${(props) => props.theme.codeInserted};
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: ${(props) => props.theme.codeImportant};
  }

  .token.entity {
    cursor: help;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 1em;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    tr {
      position: relative;
      border-bottom: 1px solid ${(props) => props.theme.tableDivider};
    }

    th {
      background: ${(props) => props.theme.tableHeaderBackground};
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid ${(props) => props.theme.tableDivider};
      position: relative;
      padding: 4px 8px;
      text-align: ${(props) => (props.rtl ? "right" : "left")};
      min-width: 100px;
    }

    .selectedCell {
      background: ${(props) => props.readOnly ? "inherit" : props.theme.tableSelectedBackground};

      /* fixes Firefox background color painting over border:
       * https://bugzilla.mozilla.org/show_bug.cgi?id=688556 */
      background-clip: padding-box;
    }

    .grip-column {
      /* usage of ::after for all of the table grips works around a bug in
       * prosemirror-tables that causes Safari to hang when selecting a cell
       * in an empty table:
       * https://github.com/ProseMirror/prosemirror/issues/947 */
      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        top: -16px;
        ${(props) => (props.rtl ? "right" : "left")}: 0;
        width: 100%;
        height: 12px;
        background: ${(props) => props.theme.tableDivider};
        border-bottom: 3px solid ${(props) => props.theme.background};
        display: ${(props) => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${(props) => props.theme.text};
      }
      &.first::after {
        border-top-${(props) => (props.rtl ? "right" : "left")}-radius: 3px;
      }
      &.last::after {
        border-top-${(props) => (props.rtl ? "left" : "right")}-radius: 3px;
      }
      &.selected::after {
        background: ${(props) => props.theme.tableSelected};
      }
    }

    .grip-row {
      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        ${(props) => (props.rtl ? "right" : "left")}: -16px;
        top: 0;
        height: 100%;
        width: 12px;
        background: ${(props) => props.theme.tableDivider};
        border-${(props) => (props.rtl ? "left" : "right")}: 3px solid;
        border-color: ${(props) => props.theme.background};
        display: ${(props) => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${(props) => props.theme.text};
      }
      &.first::after {
        border-top-${(props) => (props.rtl ? "right" : "left")}-radius: 3px;
      }
      &.last::after {
        border-bottom-${(props) => (props.rtl ? "right" : "left")}-radius: 3px;
      }
      &.selected::after {
        background: ${(props) => props.theme.tableSelected};
      }
    }

    .grip-table {
      &::after {
        content: "";
        cursor: pointer;
        background: ${(props) => props.theme.tableDivider};
        width: 13px;
        height: 13px;
        border-radius: 13px;
        border: 2px solid ${(props) => props.theme.background};
        position: absolute;
        top: -18px;
        ${(props) => (props.rtl ? "right" : "left")}: -18px;
        display: ${(props) => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${(props) => props.theme.text};
      }
      &.selected::after {
        background: ${(props) => props.theme.tableSelected};
      }
    }
  }

  .scrollable-wrapper {
    position: relative;
    margin: 0.5em 0px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &:hover {
      scrollbar-color: ${(props) => props.theme.scrollbarThumb}
        ${(props) => props.theme.scrollbarBackground};
    }

    & ::-webkit-scrollbar {
      height: 14px;
      background-color: transparent;
    }

    &:hover ::-webkit-scrollbar {
      background-color: ${(props) => props.theme.scrollbarBackground};
    }

    & ::-webkit-scrollbar-thumb {
      background-color: transparent;
      border: 3px solid transparent;
      border-radius: 7px;
    }

    &:hover ::-webkit-scrollbar-thumb {
      background-color: ${(props) => props.theme.scrollbarThumb};
      border-color: ${(props) => props.theme.scrollbarBackground};
    }
  }

  .scrollable {
    overflow-y: hidden;
    overflow-x: auto;
    padding-${(props) => (props.rtl ? "right" : "left")}: 1em;
    margin-${(props) => (props.rtl ? "right" : "left")}: -1em;
    border-${(props) => (props.rtl ? "right" : "left")}: 1px solid transparent;
    border-${(props) => (props.rtl ? "left" : "right")}: 1px solid transparent;
    transition: border 250ms ease-in-out 0s;
  }

  .scrollable-shadow {
    position: absolute;
    top: 0;
    bottom: 0;
    ${(props) => (props.rtl ? "right" : "left")}: -1em;
    width: 16px;
    transition: box-shadow 250ms ease-in-out;
    border: 0px solid transparent;
    border-${(props) => (props.rtl ? "right" : "left")}-width: 1em;
    pointer-events: none;

    &.left {
      box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
      border-left: 1em solid ${(props) => props.theme.background};
    }

    &.right {
      right: 0;
      left: auto;
      box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
    }
  }

  .block-menu-trigger {
    display: ${(props) => (props.readOnly ? "none" : "inline")};
    width: 24px;
    height: 24px;
    color: ${(props) => props.theme.textSecondary};
    background: none;
    position: absolute;
    transition: color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
      transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    outline: none;
    border: 0;
    padding: 0;
    margin-top: 1px;
    margin-${(props) => (props.rtl ? "right" : "left")}: -24px;

    &:hover,
    &:focus {
      cursor: pointer;
      transform: scale(1.2);
      color: ${(props) => props.theme.text};
    }
  }

  @media print {
    .block-menu-trigger {
      display: none;
    }

    .page-break {
      opacity: 0;
    }
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;
  }

  .ProseMirror-gapcursor:after {
    content: "";
    display: block;
    position: absolute;
    top: -2px;
    width: 20px;
    border-top: 1px solid ${(props) => props.theme.cursor};
    animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden;
    }
  }

  .ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }

  @media print {
    em,
    blockquote {
      font-family: "SF Pro Text", ${(props) => props.theme.fontFamily};
    }
  }
`;
exports.default = RichMarkdownEditor;
//# sourceMappingURL=index.js.map