// @flow
/* global window File Promise */
import * as React from "react";
import { Selection, EditorState, Plugin } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorView } from "prosemirror-view";
import { Node as PMNode, Schema } from "prosemirror-model";
import { inputRules, InputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import styled, { ThemeProvider } from "styled-components";
import { light as lightTheme, dark as darkTheme } from "./theme";
import Flex from "./components/Flex";
import Extension from "./lib/Extension";
import ExtensionManager from "./lib/ExtensionManager";
import ComponentView from "./lib/ComponentView";

// nodes
import Node from "./nodes/Node";
import Doc from "./nodes/Doc";
import Text from "./nodes/Text";
import Blockquote from "./nodes/Blockquote";
import BulletList from "./nodes/BulletList";
import CodeBlock from "./nodes/CodeBlock";
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import Heading from "./nodes/Heading";
import HorizontalRule from "./nodes/HorizontalRule";
import Image from "./nodes/Image";
import ListItem from "./nodes/ListItem";
import OrderedList from "./nodes/OrderedList";
import Paragraph from "./nodes/Paragraph";

// marks
import Mark from "./marks/Mark";
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Highlight from "./marks/Highlight";
import Italic from "./marks/Italic";
import Link from "./marks/Link";
import Strikethrough from "./marks/Strikethrough";

// plugins
import Change from "./plugins/Change";
import History from "./plugins/History";
import Keys from "./plugins/Keys";
import Placeholder from "./plugins/Placeholder";
import SmartText from "./plugins/SmartText";
import TrailingNode from "./plugins/TrailingNode";
import MarkdownPaste from "./plugins/MarkdownPaste";

export const theme = lightTheme;

export type Props = {
  id?: string,
  value?: string,
  defaultValue: string,
  placeholder: string,
  extensions: Extension[],
  autoFocus?: boolean,
  readOnly?: boolean,
  dark?: boolean,
  theme?: Object,
  uploadImage?: (file: File) => Promise<string>,
  onSave?: ({ done?: boolean }) => void,
  onCancel?: () => void,
  onChange: (value: () => string) => void,
  onImageUploadStart?: () => void,
  onImageUploadStop?: () => void,
  onSearchLink?: (term: string) => Promise<Array<Object>>,
  onClickLink?: (href: string) => void,
  onClickHashtag?: (tag: string) => void,
  onShowToast?: (message: string) => void,
  getLinkComponent?: PMNode => ?React.ComponentType<any>,
  className?: string,
  style?: Object,
};

class RichMarkdownEditor extends React.PureComponent<Props> {
  static defaultProps = {
    defaultValue: "",
    placeholder: "Write something nice…",
    onImageUploadStart: () => {},
    onImageUploadStop: () => {},
    extensions: [
      new Doc(),
      new Text(),
      new Paragraph(),
      new Blockquote(),
      new BulletList(),
      new CodeBlock(),
      new CheckboxList(),
      new CheckboxItem(),
      new Heading(),
      new HorizontalRule(),
      new Image(),
      new ListItem(),
      new Bold(),
      new Code(),
      new Highlight(),
      new Italic(),
      new Link(),
      new Strikethrough(),
      new OrderedList(),
      new Placeholder(),
      new History(),
      new SmartText(),
      new TrailingNode(),
      new MarkdownPaste(),
    ],
    tooltip: "span",
  };

  extensions: ExtensionManager;
  element: ?HTMLElement;
  view: EditorView;
  schema: Schema;
  serializer: MarkdownSerializer;
  parser: MarkdownParser;
  plugins: Plugin[];
  keymaps: Plugin[];
  inputRules: InputRule[];
  nodes: { string: Node };
  marks: { string: Mark };
  commands: Object;

  componentDidMount() {
    this.init();
    this.scrollToAnchor();

    if (this.props.readOnly) return;

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Allow changes to the 'value' prop to update the editor from outside
    if (this.props.value && prevProps.value !== this.props.value) {
      const newState = this.createState(this.props.value);
      this.view.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.setProps({
        editable: () => !this.props.readOnly,
      });
    }

    // Focus at the end of the document if switching from readOnly and autoFocus
    // is set to true
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
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
    return new ExtensionManager(
      [
        ...this.props.extensions,
        new Change({ onChange: this.handleChange }),
        new Keys({
          onSave: this.handleSave,
          onSaveAndExit: this.handleSaveAndExit,
          onCancel: this.props.onCancel,
        }),
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
    return this.props.extensions
      .filter(extension => extension.component)
      .reduce((nodeViews, extension) => {
        const nodeView = (node, view, getPos, decorations) => {
          const { component } = extension;

          return new ComponentView(component, {
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
    return this.extensions.serializer;
  }

  createParser() {
    return this.extensions.parser({
      schema: this.schema,
    });
  }

  createState(value: ?string) {
    const doc = this.createDocument(value || this.props.defaultValue);

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins: [
        ...this.plugins,
        ...this.keymaps,
        dropCursor(),
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
    const view = new EditorView(this.element, {
      state: this.createState(),
      editable: () => !this.props.readOnly,
    });

    view.setProps({
      nodeViews: this.nodeViews,

      // handlers below are used by extensions, not ProseMirror
      uploadImage: this.props.uploadImage,
      onImageUploadStart: this.props.onImageUploadStart,
      onImageUploadStop: this.props.onImageUploadStop,
      onShowToast: this.props.onShowToast,
      onClickLink: this.props.onClickLink,
      onClickHashtag: this.props.onClickHashtag,
    });

    return view;
  }

  scrollToAnchor() {
    const { hash } = window.location;
    if (!hash) return;

    try {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      // querySelector will throw an error if the hash begins with a number
      // or contains a period. This is protected against now by safeSlugify
      // however previous links may be in the wild.
      console.warn("Attempted to scroll to invalid hash", err);
    }
  }

  value = (): string => {
    return this.serializer.serialize(this.view.state.doc);
  };

  handleChange = () => {
    if (this.props.onChange && !this.props.readOnly) {
      this.props.onChange(() => {
        const text = this.value();
        console.log(text);
        return text;
      });
    }
  };

  cancelEvent = (ev: SyntheticEvent<>) => {
    ev.preventDefault();
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

  focusAtStart = () => {
    const selection = Selection.atStart(this.view.docView.node);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  focusAtEnd = () => {
    const selection = Selection.atEnd(this.view.docView.node);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  render = () => {
    const { dark, readOnly, style, className } = this.props;
    const theme = this.props.theme || (dark ? darkTheme : lightTheme);

    return (
      <Flex
        style={style}
        className={className}
        onDragOver={this.cancelEvent}
        onDragEnter={this.cancelEvent}
        align="flex-start"
        justify="center"
        column
        auto
      >
        <ThemeProvider theme={theme}>
          <React.Fragment>
            <StyledEditor
              readOnly={readOnly}
              ref={ref => (this.element = ref)}
            />
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  };
}

const StyledEditor = styled("div")`
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

  .placeholder {
    &:before {
      display: block;
      content: attr(data-empty-text);
      pointer-events: none;
      height: 0;
      color: ${props => props.theme.placeholder};
    }
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
  }

  .image.placeholder img {
    opacity: 0.5;
  }

  .caption {
    height: 1em;
    color: ${props => props.theme.textSecondary};
    text-align: center;
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
    font-weight: 500;
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
    padding-left: 1em;

    ul,
    ol {
      margin: 0.1em;
    }
  }

  ul.checkbox_list {
    list-style: none;
    padding-left: 0;
    margin-left: 0;

    ul.checkbox_list {
      padding-left: 20px;
    }
  }

  ul.checkbox_list li.checked {
    color: ${props => props.theme.textSecondary};
    text-decoration: line-through;
  }

  ul.checkbox_list li input {
    margin-right: 6px;
  }

  li p {
    display: inline;
    margin: 0;
  }

  code {
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};
    padding: 3px 4px;
    font-family: "Source Code Pro", Menlo, monospace;
    font-size: 85%;
  }

  mark {
    border-radius: 1px;
    color: ${props => props.theme.black};
    background: ${props => props.theme.textHighlight};
  }

  .code-block {
    select {
      display: ${props => (props.readOnly ? "none" : "inline")};
    }

    button {
      display: ${props => (props.readOnly ? "inline" : "none")};
    }
  }

  pre {
    display: block;
    overflow-x: auto;
    padding: 0.5em 1em;
    line-height: 1.4em;
    position: relative;
    background: ${props => props.theme.codeBackground};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};

    -webkit-font-smoothing: initial;
    font-family: ${props => props.theme.fontFamilyMono}
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
    opacity: .7;
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
`;

export default RichMarkdownEditor;
