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
const React = __importStar(require("react"));
const prosemirror_utils_1 = require("prosemirror-utils");
const outline_icons_1 = require("outline-icons");
const styled_components_1 = __importStar(require("styled-components"));
const isUrl_1 = __importDefault(require("../lib/isUrl"));
const Flex_1 = __importDefault(require("./Flex"));
const Input_1 = __importDefault(require("./Input"));
const ToolbarButton_1 = __importDefault(require("./ToolbarButton"));
const LinkSearchResult_1 = __importDefault(require("./LinkSearchResult"));
class LinkEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.discardInputValue = false;
        this.initialValue = this.href;
        this.initialSelectionLength = this.props.to - this.props.from;
        this.state = {
            selectedIndex: -1,
            value: this.href,
            previousValue: "",
            results: {},
        };
        this.componentWillUnmount = () => {
            if (this.discardInputValue) {
                return;
            }
            if (this.state.value === this.initialValue) {
                return;
            }
            const href = (this.state.value || "").trim();
            if (!href) {
                return this.handleRemoveLink();
            }
            this.save(href, href);
        };
        this.save = (href, title) => {
            href = href.trim();
            if (href.length === 0)
                return;
            this.discardInputValue = true;
            const { from, to } = this.props;
            if (!isUrl_1.default(href) && !href.startsWith("/")) {
                href = `https://${href}`;
            }
            this.props.onSelectLink({ href, title, from, to });
        };
        this.handleKeyDown = (event) => {
            switch (event.key) {
                case "Enter": {
                    event.preventDefault();
                    const { selectedIndex, value } = this.state;
                    const results = this.state.results[value] || [];
                    const { onCreateLink } = this.props;
                    if (selectedIndex >= 0) {
                        const result = results[selectedIndex];
                        if (result) {
                            this.save(result.url, result.title);
                        }
                        else if (onCreateLink && selectedIndex === results.length) {
                            this.handleCreateLink(this.suggestedLinkTitle);
                        }
                    }
                    else {
                        this.save(value, value);
                    }
                    if (this.initialSelectionLength) {
                        this.moveSelectionToEnd();
                    }
                    return;
                }
                case "Escape": {
                    event.preventDefault();
                    if (this.initialValue) {
                        this.setState({ value: this.initialValue }, this.moveSelectionToEnd);
                    }
                    else {
                        this.handleRemoveLink();
                    }
                    return;
                }
                case "ArrowUp": {
                    if (event.shiftKey)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    const prevIndex = this.state.selectedIndex - 1;
                    this.setState({
                        selectedIndex: Math.max(-1, prevIndex),
                    });
                    return;
                }
                case "ArrowDown":
                    if (event.shiftKey)
                        return;
                case "Tab": {
                    event.preventDefault();
                    event.stopPropagation();
                    const { selectedIndex, value } = this.state;
                    const results = this.state.results[value] || [];
                    const total = results.length;
                    const nextIndex = selectedIndex + 1;
                    this.setState({
                        selectedIndex: Math.min(nextIndex, total),
                    });
                    return;
                }
            }
        };
        this.handleFocusLink = (selectedIndex) => {
            this.setState({ selectedIndex });
        };
        this.handleChange = async (event) => {
            const value = event.target.value;
            this.setState({
                value,
                selectedIndex: -1,
            });
            const trimmedValue = value.trim();
            if (trimmedValue && this.props.onSearchLink) {
                try {
                    const results = await this.props.onSearchLink(trimmedValue);
                    this.setState(state => ({
                        results: Object.assign(Object.assign({}, state.results), { [trimmedValue]: results }),
                        previousValue: trimmedValue,
                    }));
                }
                catch (error) {
                    console.error(error);
                }
            }
        };
        this.handleOpenLink = (event) => {
            event.preventDefault();
            this.props.onClickLink(this.href, event);
        };
        this.handleCreateLink = (value) => {
            this.discardInputValue = true;
            const { onCreateLink } = this.props;
            value = value.trim();
            if (value.length === 0)
                return;
            if (onCreateLink)
                return onCreateLink(value);
        };
        this.handleRemoveLink = () => {
            this.discardInputValue = true;
            const { from, to, mark, view, onRemoveLink } = this.props;
            const { state, dispatch } = this.props.view;
            if (mark) {
                dispatch(state.tr.removeMark(from, to, mark));
            }
            if (onRemoveLink) {
                onRemoveLink();
            }
            view.focus();
        };
        this.handleSelectLink = (url, title) => event => {
            event.preventDefault();
            this.save(url, title);
            if (this.initialSelectionLength) {
                this.moveSelectionToEnd();
            }
        };
        this.moveSelectionToEnd = () => {
            const { to, view } = this.props;
            const { state, dispatch } = view;
            dispatch(prosemirror_utils_1.setTextSelection(to)(state.tr));
            view.focus();
        };
    }
    get href() {
        return this.props.mark ? this.props.mark.attrs.href : "";
    }
    get suggestedLinkTitle() {
        const { state } = this.props.view;
        const { value } = this.state;
        const selectionText = state.doc.cut(state.selection.from, state.selection.to).textContent;
        return value.trim() || selectionText.trim();
    }
    render() {
        const { dictionary, theme } = this.props;
        const { value, selectedIndex } = this.state;
        const results = this.state.results[value.trim()] ||
            this.state.results[this.state.previousValue] ||
            [];
        const Tooltip = this.props.tooltip;
        const looksLikeUrl = value.match(/^https?:\/\//i);
        const suggestedLinkTitle = this.suggestedLinkTitle;
        const showCreateLink = !!this.props.onCreateLink &&
            !(suggestedLinkTitle === this.initialValue) &&
            suggestedLinkTitle.length > 0 &&
            !looksLikeUrl;
        const showResults = !!suggestedLinkTitle && (showCreateLink || results.length > 0);
        return (React.createElement(Wrapper, null,
            React.createElement(Input_1.default, { value: value, placeholder: showCreateLink
                    ? dictionary.findOrCreateDoc
                    : dictionary.searchOrPasteLink, onKeyDown: this.handleKeyDown, onChange: this.handleChange, autoFocus: this.href === "" }),
            React.createElement(ToolbarButton_1.default, { onClick: this.handleOpenLink, disabled: !value },
                React.createElement(Tooltip, { tooltip: dictionary.openLink, placement: "top" },
                    React.createElement(outline_icons_1.OpenIcon, { color: theme.toolbarItem }))),
            React.createElement(ToolbarButton_1.default, { onClick: this.handleRemoveLink },
                React.createElement(Tooltip, { tooltip: dictionary.removeLink, placement: "top" }, this.initialValue ? (React.createElement(outline_icons_1.TrashIcon, { color: theme.toolbarItem })) : (React.createElement(outline_icons_1.CloseIcon, { color: theme.toolbarItem })))),
            showResults && (React.createElement(SearchResults, { id: "link-search-results" },
                results.map((result, index) => (React.createElement(LinkSearchResult_1.default, { key: result.url, title: result.title, subtitle: result.subtitle, icon: React.createElement(outline_icons_1.DocumentIcon, { color: theme.toolbarItem }), onMouseOver: () => this.handleFocusLink(index), onClick: this.handleSelectLink(result.url, result.title), selected: index === selectedIndex }))),
                showCreateLink && (React.createElement(LinkSearchResult_1.default, { key: "create", title: suggestedLinkTitle, subtitle: dictionary.createNewDoc, icon: React.createElement(outline_icons_1.PlusIcon, { color: theme.toolbarItem }), onMouseOver: () => this.handleFocusLink(results.length), onClick: () => {
                        this.handleCreateLink(suggestedLinkTitle);
                        if (this.initialSelectionLength) {
                            this.moveSelectionToEnd();
                        }
                    }, selected: results.length === selectedIndex }))))));
    }
}
const Wrapper = styled_components_1.default(Flex_1.default) `
  margin-left: -8px;
  margin-right: -8px;
  min-width: 336px;
`;
const SearchResults = styled_components_1.default.ol `
  background: ${props => props.theme.toolbarBackground};
  position: absolute;
  top: 100%;
  width: 100%;
  height: auto;
  left: 0;
  padding: 4px 8px 8px;
  margin: 0;
  margin-top: -3px;
  margin-bottom: 0;
  border-radius: 0 0 4px 4px;
  overflow-y: auto;
  max-height: 25vh;
`;
exports.default = styled_components_1.withTheme(LinkEditor);
//# sourceMappingURL=LinkEditor.js.map