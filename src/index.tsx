/* global window File Promise */
import * as React from "react";
import { Portal } from "react-portal";
import { EditorState, Selection, Plugin } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorView } from "prosemirror-view";
import { Schema, NodeSpec, MarkSpec, Slice } from "prosemirror-model";
import { inputRules, InputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { selectColumn, selectRow, selectTable } from "prosemirror-utils";
import styled, { ThemeProvider } from "styled-components";
import { light as lightTheme, dark as darkTheme } from "./theme";
import Flex from "./components/Flex";
import { SearchResult } from "./components/LinkEditor";
import { EmbedDescriptor } from "./types";
import SelectionToolbar, { getText, iOS, android } from "./components/SelectionToolbar";
import BlockMenu from "./components/BlockMenu";
import Tooltip from "./components/Tooltip";
import Extension from "./lib/Extension";
import ExtensionManager from "./lib/ExtensionManager";
import ComponentView from "./lib/ComponentView";
import headingToSlug from "./lib/headingToSlug";

// nodes
import ReactNode from "./nodes/ReactNode";
import Doc from "./nodes/Doc";
import Text from "./nodes/Text";
import Blockquote from "./nodes/Blockquote";
import BulletList from "./nodes/BulletList";
import CodeBlock from "./nodes/CodeBlock";
import CodeFence from "./nodes/CodeFence";
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import Embed from "./nodes/Embed";
import HardBreak from "./nodes/HardBreak";
import Heading from "./nodes/Heading";
import HorizontalRule from "./nodes/HorizontalRule";
import Image from "./nodes/Image";
import ListItem from "./nodes/ListItem";
import Notice from "./nodes/Notice";
import OrderedList from "./nodes/OrderedList";
import Paragraph from "./nodes/Paragraph";
import Table from "./nodes/Table";
import TableCell from "./nodes/TableCell";
import TableHeadCell from "./nodes/TableHeadCell";
import TableRow from "./nodes/TableRow";

// marks
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Highlight from "./marks/Highlight";
import Italic from "./marks/Italic";
import Link from "./marks/Link";
import Strikethrough from "./marks/Strikethrough";
import TemplatePlaceholder from "./marks/Placeholder";

// plugins
import BlockMenuTrigger from "./plugins/BlockMenuTrigger";
import SearchTrigger from "./plugins/SearchTrigger";
import History from "./plugins/History";
import Keys from "./plugins/Keys";
import Placeholder from "./plugins/Placeholder";
import SmartText from "./plugins/SmartText";
import TrailingNode from "./plugins/TrailingNode";
import MarkdownPaste from "./plugins/MarkdownPaste";

import createAndInsertLink from "./commands/createAndInsertLink";

export { schema, parser, serializer } from "./server";

export { default as Extension } from "./lib/Extension";

export const theme = lightTheme;

export type Props = {
  id?: string;
  value?: string;
  defaultValue: string;
  placeholders: Array<string>;
  extensions: Extension[];
  autoFocus?: boolean;
  readOnly?: boolean;
  readOnlyWriteCheckboxes?: boolean;
  dark?: boolean;
  theme?: typeof theme;
  template?: boolean;
  headingsOffset?: number;
  scrollTo?: string;
  handleDOMEvents?: {
    [name: string]: (view: EditorView, event: Event) => boolean;
  };
  uploadImage?: (file: File) => Promise<string>;
  onSave?: ({ done: boolean }) => void;
  onCancel?: () => void;
  onChange: (value: () => string) => void;
  onImageUploadStart?: () => void;
  onImageUploadStop?: () => void;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: Object) => Promise<SearchResult[]>;
  searchResultList?: typeof React.Component;
  searchResultsOpen?: boolean;
  blockPlaceholders?: Array<string>;
  onClickLink: (href: string) => void;
  onHoverLink?: (event: MouseEvent) => boolean;
  onClickHashtag?: (tag: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  embeds: EmbedDescriptor[];
  onShowToast?: (message: string) => void;
  tooltip: typeof React.Component;
  className?: string;
  style?: Record<string, string>;
};

type State = {
  blockMenuOpen: boolean;
  linkMenuOpen: boolean;
  triggerSearch: string;
  searchSource: string;
  searchTriggerOpen: boolean;
  blockMenuSearch: string;
  linkFrom: number;
  linkTo: number;
  extraUpdate: number;
};

type Step = {
  slice: Slice;
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    placeholders: ["Write note…"],
    onImageUploadStart: () => {
      // no default behavior
    },
    onImageUploadStop: () => {
      // no default behavior
    },
    onClickLink: href => {
      window.open(href, "_blank");
    },
    embeds: [],
    extensions: [],
    tooltip: Tooltip,
    searchResultsOpen: false,
    blockPlaceholders: ["Type '/' to insert block…"]
  };

  state = {
    blockMenuOpen: false,
    linkMenuOpen: false,
    searchTriggerOpen: !!this.props.searchResultsOpen,
    searchSource: "typing",
    triggerSearch: "",
    blockMenuSearch: "",
    linkFrom: 0,
    linkTo: 0,
    extraUpdate: 0
  };

  extensions: ExtensionManager;
  element?: HTMLElement | null;
  view: EditorView;
  schema: Schema;
  serializer: MarkdownSerializer;
  parser: MarkdownParser;
  plugins: Plugin[];
  keymaps: Plugin[];
  inputRules: InputRule[];
  nodeViews: {
    [name: string]: (node, view, getPos, decorations) => ComponentView;
  };
  nodes: { [name: string]: NodeSpec };
  marks: { [name: string]: MarkSpec };
  commands: Record<string, any>;
  resizeObserver: any;

  menuRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.init();

    if (this.props.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    if (this.props.readOnly) return;

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }

    // resizeObserver might not be enabled by default for ios safari (suggest users to enable using `Experimental webkit features`)
    if (iOS()) {
      try {
        this.resizeObserver = new ResizeObserver((entries) => {
            this.setState({ extraUpdate: 1 });
          });
      } catch {
        const tip = "For the smoothest experience, enable 'ResizeObserver' in Settings > Safari > Advanced > Experimental Features";
        this.props.onShowToast && this.props.onShowToast(tip);
        console.warn(tip);
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState) {
    // Allow changes to the 'value' prop to update the editor from outside
    if (this.props.value && prevProps.value !== this.props.value) {
      const newState = this.createState(this.props.value);
      this.view.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.update({
        ...this.view.props,
        editable: () => !this.props.readOnly,
      });
    }

    if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    // Focus at the end of the document if switching from readOnly and autoFocus
    // is set to true
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
    }

    if (prevState.triggerSearch === this.state.triggerSearch) {
      const selectedText = this.view && getText(this.view.state.selection.content());
      // problem prevents searching from linkeditor on ios
      const linkEditorSearchOverridden = this.state.triggerSearch && this.state.searchSource === "linkEditor";
      selectedText && selectedText !== this.state.triggerSearch && (!linkEditorSearchOverridden) && this.setState({ triggerSearch: selectedText, searchSource: "selection", searchTriggerOpen: true, linkFrom: 0, linkTo: 0 });
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
    // adding nodes here? Update schema.ts for serialization on the server
    return new ExtensionManager(
      [
        new Doc(),
        new Text(),
        new HardBreak(),
        new Paragraph(),
        new Blockquote(),
        new BulletList(),
        new CodeBlock({
          initialReadOnly: this.props.readOnly,
          onShowToast: this.props.onShowToast,
        }),
        new CodeFence({
          initialReadOnly: this.props.readOnly,
          onShowToast: this.props.onShowToast,
        }),
        new CheckboxList(),
        new CheckboxItem(),
        new Embed(),
        new ListItem(),
        new Notice(),
        new Heading({
          onShowToast: this.props.onShowToast,
          offset: this.props.headingsOffset,
        }),
        new HorizontalRule(),
        new Image({
          uploadImage: this.props.uploadImage,
          onImageUploadStart: this.props.onImageUploadStart,
          onImageUploadStop: this.props.onImageUploadStop,
          onShowToast: this.props.onShowToast,
        }),
        new Table(),
        new TableCell({
          onSelectTable: this.handleSelectTable,
          onSelectRow: this.handleSelectRow,
        }),
        new TableHeadCell({
          onSelectColumn: this.handleSelectColumn,
        }),
        new TableRow(),
        new Bold(),
        new Code(),
        new Highlight(),
        new Italic(),
        new TemplatePlaceholder(),
        new Link({
          onKeyboardShortcut: () => {}, // this.handleOpenLinkMenu
          onClickLink: this.props.onClickLink,
          onHoverLink: this.props.onHoverLink,
          onClickHashtag: this.props.onClickHashtag,
        }),
        new Strikethrough(),
        new OrderedList(),
        new History(),
        new SmartText(),
        new TrailingNode(),
        new MarkdownPaste({onPaste: this.handlePasteSearchTrigger}),
        new Keys({
          onSave: this.handleSave,
          onSaveAndExit: this.handleSaveAndExit,
          onCancel: this.props.onCancel,
        }),
        new BlockMenuTrigger({
          onOpen: this.handleOpenBlockMenu,
          onClose: this.handleCloseBlockMenu,
          placeholders: this.props.blockPlaceholders
        }),
        new SearchTrigger({
          onOpen: this.handleOpenSearchTrigger,
          onClose: this.handleCloseSearchTriggerForTyping,
        }),
        new Placeholder({
          placeholders: this.props.placeholders,
        }),
        ...this.props.extensions,
      ],
      this
    );
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
      .filter((extension: ReactNode) => extension.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView = (node, view, getPos, decorations) => {
          return new ComponentView(extension.component, {
            editor: this,
            extension,
            node,
            view,
            getPos,
            decorations,
          });
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView,
        };
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
    return new Schema({
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

  createState(value?: string) {
    const doc = this.createDocument(value || this.props.defaultValue);

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins: [
        ...this.plugins,
        ...this.keymaps,
        dropCursor({ color: this.props.theme?.cursor || "black" }),
        gapCursor(),
        inputRules({
          rules: this.inputRules,
        }),
        keymap(baseKeymap),
      ],
    });
  }

  createDocument(content: string) {
    return this.parser.parse(content);
  }

  createView() {
    if (!this.element) {
      throw new Error("createView called before ref available");
    }

    const isEditingCheckbox = tr => {
      return tr.steps.some(
        (step: Step) =>
          step.slice.content.firstChild &&
          step.slice.content.firstChild.type.name ===
            this.schema.nodes.checkbox_item.name
      );
    };

    const view = new EditorView(this.element, {
      state: this.createState(),
      editable: () => !this.props.readOnly,
      nodeViews: this.nodeViews,
      handleDOMEvents: this.props.handleDOMEvents,
      dispatchTransaction: transaction => {
        const { state, transactions } = this.view.state.applyTransaction(
          transaction
        );

        this.view.updateState(state);

        // If any of the transactions being dispatched resulted in the doc
        // changing then call our own change handler to let the outside world
        // know
        if (
          transactions.some(tr => tr.docChanged) &&
          (!this.props.readOnly ||
            (this.props.readOnlyWriteCheckboxes &&
              transactions.some(isEditingCheckbox)))
        ) {
          this.handleChange();
        }

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        this.forceUpdate();
      },
    });

    return view;
  }

  scrollToAnchor(hash: string) {
    if (!hash) return;

    try {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      // querySelector will throw an error if the hash begins with a number
      // or contains a period. This is protected against now by safeSlugify
      // however previous links may be in the wild.
      console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
    }
  }

  value = (): string => {
    return this.serializer.serialize(this.view.state.doc);
  };

  handleChange = () => {
    if (!this.props.onChange) return;

    this.props.onChange(() => {
      return this.value();
    });
  };

  handleSave = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: false });
    }
  };

  handleSaveAndExit = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: true });
    }
  };

  handleOpenLinkMenu = () => {
    this.setState({ linkMenuOpen: true });
  };

  handleCloseLinkMenu = () => {
    this.setState({ linkMenuOpen: false });
  };

  handleOpenSearchTrigger = (triggerSearch) => {
    this.setState({ searchTriggerOpen: true, triggerSearch, searchSource: "typing", linkFrom: 0, linkTo: 0 });
  };

  handlePasteSearchTrigger = (triggerSearch) => {
    this.setState({ searchTriggerOpen: true, triggerSearch, searchSource: "paste", linkFrom: 0, linkTo: 0 });
  };

  handleCloseSearchTrigger = () => {
    this.setState({ searchTriggerOpen: false, triggerSearch: "" });
  };

  handleCloseSearchTriggerForTyping = () => {
    const { from, to } = this.view.state.selection;
    if (this.state.searchSource === "typing" || from === to) {
      this.setState({ searchTriggerOpen: false, triggerSearch: "" });
    }
  };

  handleOpenBlockMenu = (search: string) => {
    this.setState({ blockMenuOpen: true, blockMenuSearch: search });
  };

  handleCloseBlockMenu = () => {
    if (!this.state.blockMenuOpen) return;
    this.setState({ blockMenuOpen: false });
  };

  handleSelectRow = (index: number, state: EditorState) => {
    this.view.dispatch(selectRow(index)(state.tr));
  };

  handleSelectColumn = (index: number, state: EditorState) => {
    this.view.dispatch(selectColumn(index)(state.tr));
  };

  handleSelectTable = (state: EditorState) => {
    this.view.dispatch(selectTable(state.tr));
  };

  // 'public' methods
  focusAtStart = () => {
    const selection = Selection.atStart(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  focusAtEnd = () => {
    const selection = Selection.atEnd(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  getHeadings = () => {
    const headings: { title: string; level: number; id: string }[] = [];
    const previouslySeen = {};

    this.view.state.doc.forEach(node => {
      if (node.type.name === "heading") {
        // calculate the optimal slug
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
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

  handleOnCreateLink = async (title: string, { fromOffset = 0, toOffset = 0 } = {}) => {
    const { onCreateLink, onShowToast } = this.props;

    this.handleCloseLinkMenu();
    this.view.focus();

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = this.view;
    const { from, to } = state.selection;

    const href = `creating#${title}…`;

    if (from === to) {
      const offset = -this.state.triggerSearch.length;
      // Insert a placeholder link
      dispatch(
        this.view.state.tr
          .insertText(title, from + offset + fromOffset, to + toOffset)
          .addMark(
            from + offset + fromOffset,
            to + offset + fromOffset + toOffset + title.length,
            state.schema.marks.link.create({ href })
          )
      );
    } else {
      dispatch(
        this.view.state.tr
          .addMark(from, to, state.schema.marks.link.create({ href }))
      );
    }

    createAndInsertLink(this.view, title, href, {
      onCreateLink,
      onShowToast,
    });
    this.handleCloseSearchTrigger();
  };

  handleOnSelectLink = ({
    href,
    title,
    fromOffset = 0,
    toOffset = 0
  }: {
    href: string;
    title: string;
    fromOffset: number;
    toOffset: number;
  }) => {
    this.handleCloseLinkMenu();
    this.view.focus();

    const { dispatch, state } = this.view;
    if (this.state.linkFrom && this.state.linkTo) {
      // inset from selection toolbar link editor
      const markType = state.schema.marks.link;
      const from = this.state.linkFrom;
      const to = this.state.linkTo;
      dispatch(
        state.tr
          .removeMark(from, to, markType)
          .addMark(from, to, markType.create({ href }))
      );
    } else {
      const from = state.selection.from;
      const to = state.selection.to;

      if (from === to) {
        // insert by simple click
        const offset = -this.state.triggerSearch.length;
        dispatch(
          this.view.state.tr
            .insertText(title, from + offset + fromOffset, to + toOffset)
            .addMark(
              from + offset + fromOffset,
              to + offset + fromOffset + toOffset + title.length,
              state.schema.marks.link.create({ href })
            )
        );
      } else {
        // insert by select and click
        dispatch(
          this.view.state.tr
            .addMark(from, to, state.schema.marks.link.create({ href }))
        );
      }
    }
    this.handleCloseSearchTrigger();
  };

  calculatePosition(isActive) {
    const hiddenPos = {
      left: -1000,
      top: 0,
      bottom: undefined,
      isAbove: false,
    };
    if (!this.view) {
      return hiddenPos;
    }
    const { selection } = this.view.state;

    const paragraph = this.view.domAtPos(selection.$from.pos);
    if (
      !isActive ||
      !paragraph.node
    ) {
      return hiddenPos;
    }
    // not sure why this cast is not necessary in Blockmenu.tsx
    const node = (paragraph.node as any);
    const { top, left, bottom } = node.getBoundingClientRect ? node.getBoundingClientRect() : node.parentNode.getBoundingClientRect();
  
    const isIos = iOS();
    const isAndroid = android();

    const startPos = this.view.coordsAtPos(selection.$to.pos);
    const ref = this.menuRef.current;
    const canCalculateBottomMargin = !isIos;
    if (!canCalculateBottomMargin && !ref) {
      // on iphone, if offsetHeight cannot be calculated correctly, might show over current line, avoid
      return hiddenPos;
    }
    const offsetHeight = ref ? ref.offsetHeight : 0;

    ref && this.resizeObserver && this.resizeObserver.observe(ref);
    const margin = 24;
    let pos;

    const editBarOnTop = this.state.searchSource === "linkEditor" || (this.state.searchSource === "selection" && !isIos && !isAndroid);
    // ios native bar adjust automatically top or bottom depending on other bars
    const nativeBarOnTop = isAndroid;
    const enoughSpaceAtBottom = canCalculateBottomMargin && window.innerHeight - startPos.bottom - offsetHeight > margin;
    if ((editBarOnTop || nativeBarOnTop || enoughSpaceAtBottom)) {
      pos = {
        left: left + window.scrollX,
        top: bottom + window.scrollY,
        bottom: undefined,
        maxHeight: window.innerHeight - (bottom + window.scrollY),
        isAbove: true,
      };
    } else {
      // on ios initially searchmenu may show facing downwards over current line, probably offsetHeight = 0?
      // For ios calculating bottom is extremely problematic when keyboard comes up. Instead use offsetHeight of search menu and set top (drawback is that height always lags to the result of the previously typed letter)
      pos =  {
        left: left + window.scrollX,
        top: isIos ? bottom + window.scrollY - offsetHeight - margin : undefined,
        bottom: isIos ? undefined : window.innerHeight - top - window.scrollY,
        maxHeight: top,
        isAbove: false,
      };
    }
    if (isIos) {
      // set state to do extra update to prevent search menu height lagging
      this.setState({ extraUpdate: 0 });
    }
    return pos;
  }

  render = () => {
    const {
      readOnly,
      readOnlyWriteCheckboxes,
      style,
      tooltip,
      className,
      onKeyDown,
      searchResultList: SearchResultList
    } = this.props;

    const position = this.calculatePosition(this.state.searchTriggerOpen);
    
    const theme = this.props.theme || lightTheme;
    return (
      <Flex
        onKeyDown={onKeyDown}
        style={style}
        className={className}
        align="flex-start"
        justify="center"
        column
      >
        <ThemeProvider theme={theme}>
          <React.Fragment>
            <StyledEditor
              readOnly={readOnly}
              readOnlyWriteCheckboxes={readOnlyWriteCheckboxes}
              ref={ref => (this.element = ref)}
            />
            {!readOnly && this.view && (
              <React.Fragment>
                <SelectionToolbar
                  view={this.view}
                  commands={this.commands}
                  onSearchLink={searchVars => this.setState(searchVars)}
                  isTemplate={this.props.template === true}
                  onClickLink={this.props.onClickLink}
                  tooltip={tooltip}
                />
                <BlockMenu
                  view={this.view}
                  commands={this.commands}
                  isActive={this.state.blockMenuOpen}
                  search={this.state.blockMenuSearch}
                  onClose={this.handleCloseBlockMenu}
                  uploadImage={this.props.uploadImage}
                  onLinkToolbarOpen={this.handleOpenLinkMenu}
                  onImageUploadStart={this.props.onImageUploadStart}
                  onImageUploadStop={this.props.onImageUploadStop}
                  onShowToast={this.props.onShowToast}
                  embeds={this.props.embeds}
                />
                {SearchResultList && (
                  // Need to pass this handleOnCreateLink and handleOnSelectLink from LinkToolbar
                  // But needs to replace search text like clearSearch in BlockMenu
                  <Portal>
                    <Wrapper
                      id="search-menu-container"
                      active={this.state.searchTriggerOpen}
                      ref={this.menuRef}
                      {...position}
                    >
                      <SearchResultList
                        search={this.state.triggerSearch}
                        searchSource={this.state.searchSource}
                        isActive={this.state.searchTriggerOpen}
                        onSearchLink={this.props.onSearchLink}
                        handleOnSelectLink={this.handleOnSelectLink}
                        handleOnCreateLink={this.handleOnCreateLink}
                        onClickLink={this.props.onClickLink}
                      />
                    </Wrapper>
                  </Portal>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  };
}

const Wrapper = styled.div<{
  active: boolean;
  top?: number;
  bottom?: number;
  left?: number;
  // FIXME maxHeight wrong on iphone, either way too small or too big
  maxHeight?: number;
  isAbove: boolean;
}>`
  color: ${props => props.theme.text};
  font-family: ${props => props.theme.fontFamily};
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 9999;
  }};
  ${props => props.top && `top: ${props.top}px`};
  ${props => props.bottom && `bottom: ${props.bottom}px`};
  left: ${props => props.left}px;
  background-color: ${props => props.theme.blockToolbarBackground};
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.08) 0px 4px 8px, rgba(0, 0, 0, 0.08) 0px 2px 4px;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  box-sizing: border-box;
  pointer-events: none;
  ${props => props.maxHeight && `max-height: ${props.maxHeight}px`};
  overflow-y: scroll;

  * {
    box-sizing: border-box;
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${props => props.theme.blockToolbarDivider};
  }

  ${({ active, isAbove }) =>
    active &&
    `
    transform: translateY(${isAbove ? "6px" : "-6px"}) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;

const StyledEditor = styled("div")<{
  readOnly?: boolean;
  readOnlyWriteCheckboxes?: boolean;
}>`
  color: ${props => props.theme.text};
  background: ${props => props.theme.background};
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
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

  img {
    max-width: 100%;
  }

  .image {
    text-align: center;

    img {
      pointer-events: ${props => (props.readOnly ? "initial" : "none")};
    }
  }

  .image.placeholder {
    position: relative;
    background: ${props => props.theme.background};

    img {
      opacity: 0.5;
    }
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
    outline: 2px solid ${props => props.theme.selected};
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: "";
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid ${props => props.theme.selected};
    pointer-events: none;
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
      display: ${props => (props.readOnly ? "none" : "block")};
      position: absolute;
      font-family: ${props => props.theme.fontFamilyMono};
      color: ${props => props.theme.textSecondary};
      font-size: 13px;
      left: -24px;
    }
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
    line-height: 3em;
  }
  h2:not(.placeholder):before {
    content: "H2";
    line-height: 2.8em;
  }
  h3:not(.placeholder):before {
    content: "H3";
    line-height: 2.3em;
  }
  h4:not(.placeholder):before {
    content: "H4";
    line-height: 2.2em;
  }
  h5:not(.placeholder):before {
    content: "H5";
  }
  h6:not(.placeholder):before {
    content: "H6";
  }

  .heading-name {
    color: ${props => props.theme.text};

    &:hover {
      text-decoration: none;

      .heading-anchor {
        opacity: 1;
      }
    }
  }

  .with-emoji {
    margin-left: -1em;
  }

  .heading-anchor {
    opacity: 0;
    display: ${props => (props.readOnly ? "block" : "none")};
    color: ${props => props.theme.textSecondary};
    cursor: pointer;
    background: none;
    border: 0;
    outline: none;
    padding: 2px 12px 2px 4px;
    margin: 0;
    position: absolute;
    transition: opacity 100ms ease-in-out;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 22px;
    left: -1.3em;

    &:focus,
    &:hover {
      color: ${props => props.theme.text};
    }
  }

  .placeholder {
    &:before {
      display: block;
      content: ${props => (props.readOnly ? "" : "attr(data-empty-text)")};
      pointer-events: none;
      height: 0;
      color: ${props => props.theme.placeholder};
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
    background: ${props => props.theme.noticeInfoBackground};
    color: ${props => props.theme.noticeInfoText};
    border-radius: 4px;
    padding: 8px 16px;
    margin: 8px 0;

    a {
      color: ${props => props.theme.noticeInfoText};
    }

    a:not(.heading-name) {
      text-decoration: underline;
    }
  }

  .notice-block .icon {
    width: 24px;
    height: 24px;
    align-self: flex-start;
    margin-right: 4px;
    position: relative;
    top: 1px;
  }

  .notice-block.tip {
    background: ${props => props.theme.noticeTipBackground};
    color: ${props => props.theme.noticeTipText};

    a {
      color: ${props => props.theme.noticeTipText};
    }
  }

  .notice-block.warning {
    background: ${props => props.theme.noticeWarningBackground};
    color: ${props => props.theme.noticeWarningText};

    a {
      color: ${props => props.theme.noticeWarningText};
    }
  }

  blockquote {
    border-left: 3px solid ${props => props.theme.quote};
    margin: 0;
    padding-left: 10px;
    font-style: italic;
  }

  b,
  strong {
    font-weight: 600;
  }

  .template-placeholder {
    color: ${props => props.theme.placeholder};
    border-bottom: 1px dotted ${props => props.theme.placeholder};
    border-radius: 2px;
    cursor: text;

    &:hover {
      border-bottom: 1px dotted
        ${props =>
          props.readOnly ? props.theme.placeholder : props.theme.textSecondary};
    }
  }

  p {
    position: relative;
    margin: 0;
  }

  a {
    color: ${props => props.theme.link};
  }

  a:hover {
    text-decoration: ${props => (props.readOnly ? "underline" : "none")};
  }

  ul,
  ol {
    margin: 0 0.1em;
    padding: 0 0 0 1em;

    ul,
    ol {
      margin: 0;
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
    margin: 0;
  }

  ul.checkbox_list li {
    display: flex;
  }

  ul.checkbox_list li.checked > div > p {
    color: ${props => props.theme.textSecondary};
    text-decoration: line-through;
  }

  ul.checkbox_list li input {
    pointer-events: ${props =>
      props.readOnly && !props.readOnlyWriteCheckboxes ? "none" : "initial"};
    opacity: ${props =>
      props.readOnly && !props.readOnlyWriteCheckboxes ? 0.75 : 1};
    margin: 0 0.5em 0 0;
    width: 14px;
    height: 14px;
  }

  li p:first-child {
    margin: 0;
  }

  hr {
    height: 0;
    border: 0;
    border-top: 1px solid ${props => props.theme.horizontalRule};
  }

  code {
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};
    padding: 3px 4px;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 85%;
  }

  mark {
    border-radius: 1px;
    color: ${props => props.theme.black};
    background: ${props => props.theme.textHighlight};
  }

  .code-block,
  .notice-block {
    position: relative;

    select,
    button {
      background: ${props => props.theme.blockToolbarBackground};
      color: ${props => props.theme.blockToolbarItem};
      border-width: 1px;
      font-size: 13px;
      display: none;
      position: absolute;
      border-radius: 4px;
      padding: 2px;
      z-index: 1;
      top: 4px;
      right: 4px;
    }

    button {
      padding: 2px 4px;
    }

    &:hover {
      select {
        display: ${props => (props.readOnly ? "none" : "inline")};
      }

      button {
        display: ${props => (props.readOnly ? "inline" : "none")};
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
    background: ${props => props.theme.codeBackground};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};

    -webkit-font-smoothing: initial;
    font-family: ${props => props.theme.fontFamilyMono};
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
    color: ${props => props.theme.code};
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
    color: ${props => props.theme.codeComment};
  }

  .token.punctuation {
    color: ${props => props.theme.codePunctuation};
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.operator,
  .token.boolean,
  .token.number {
    color: ${props => props.theme.codeNumber};
  }

  .token.property {
    color: ${props => props.theme.codeProperty};
  }

  .token.tag {
    color: ${props => props.theme.codeTag};
  }

  .token.string {
    color: ${props => props.theme.codeString};
  }

  .token.selector {
    color: ${props => props.theme.codeSelector};
  }

  .token.attr-name {
    color: ${props => props.theme.codeAttr};
  }

  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${props => props.theme.codeEntity};
  }

  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit {
    color: ${props => props.theme.codeKeyword};
  }

  .token.function {
    color: ${props => props.theme.codeFunction};
  }

  .token.statement,
  .token.regex,
  .token.atrule {
    color: ${props => props.theme.codeStatement};
  }

  .token.placeholder,
  .token.variable {
    color: ${props => props.theme.codePlaceholder};
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted ${props => props.theme.codeInserted};
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
    color: ${props => props.theme.codeImportant};
  }

  .token.entity {
    cursor: help;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 1em;

    tr {
      position: relative;
      border-bottom: 1px solid ${props => props.theme.tableDivider};
    }

    th {
      background: ${props => props.theme.tableHeaderBackground};
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid ${props => props.theme.tableDivider};
      position: relative;
      padding: 4px 8px;
      text-align: left;
      min-width: 100px;
    }

    .selectedCell {
      background: ${props =>
        props.readOnly ? "inherit" : props.theme.tableSelectedBackground};
    }

    .grip-column {
      cursor: pointer;
      position: absolute;
      top: -16px;
      left: 0;
      width: 100%;
      height: 12px;
      background: ${props => props.theme.tableDivider};
      border-bottom: 3px solid ${props => props.theme.background};
      display: ${props => (props.readOnly ? "none" : "block")};

      &:hover {
        background: ${props => props.theme.text};
      }
      &.first {
        border-top-left-radius: 3px;
      }
      &.last {
        border-top-right-radius: 3px;
      }
      &.selected {
        background: ${props => props.theme.tableSelected};
      }
    }

    .grip-row {
      cursor: pointer;
      position: absolute;
      left: -16px;
      top: 0;
      height: 100%;
      width: 12px;
      background: ${props => props.theme.tableDivider};
      border-right: 3px solid ${props => props.theme.background};
      display: ${props => (props.readOnly ? "none" : "block")};

      &:hover {
        background: ${props => props.theme.text};
      }
      &.first {
        border-top-left-radius: 3px;
      }
      &.last {
        border-bottom-left-radius: 3px;
      }
      &.selected {
        background: ${props => props.theme.tableSelected};
      }
    }

    .grip-table {
      cursor: pointer;
      background: ${props => props.theme.tableDivider};
      width: 13px;
      height: 13px;
      border-radius: 13px;
      border: 2px solid ${props => props.theme.background};
      position: absolute;
      top: -18px;
      left: -18px;
      display: ${props => (props.readOnly ? "none" : "block")};

      &:hover {
        background: ${props => props.theme.text};
      }
      &.selected {
        background: ${props => props.theme.tableSelected};
      }
    }
  }

  .scrollable-wrapper {
    position: relative;
    margin: 0.5em 0px;
  }

  .scrollable {
    overflow-y: hidden;
    overflow-x: scroll;
    padding-left: 1em;
    margin-left: -1em;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    transition: border 250ms ease-in-out 0s;
  }

  .scrollable-shadow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1em;
    width: 16px;
    transition: box-shadow 250ms ease-in-out;
    border: 0px solid transparent;
    border-left-width: 1em;
    pointer-events: none;

    &.left {
      box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
      border-left: 1em solid ${props => props.theme.background};
    }

    &.right {
      right: 0;
      left: auto;
      box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
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
    border-top: 1px solid ${props => props.theme.cursor};
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
      font-family: "SF Pro Text", ${props => props.theme.fontFamily};
    }
  }
`;

export default RichMarkdownEditor;
