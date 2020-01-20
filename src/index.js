// @flow
/* global window File Promise */
import * as React from "react";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { inputRules, InputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import styled, { ThemeProvider } from "styled-components";
import type { SearchResult } from "./types";
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
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import Heading from "./nodes/Heading";
// import HardBreak from "./nodes/HardBreak";
import HorizontalRule from "./nodes/HorizontalRule";
import Image from "./nodes/Image";
import ListItem from "./nodes/ListItem";
import OrderedList from "./nodes/OrderedList";
import Paragraph from "./nodes/Paragraph";

// marks
import Mark from "./marks/Mark";
import Bold from "./marks/Bold";
import Code from "./marks/Code";
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

export const theme = lightTheme;

export type Props = {
  id?: string,
  defaultValue: string,
  placeholder: string,
  pretitle?: string,
  extensions: Extension[],
  autoFocus?: boolean,
  readOnly?: boolean,
  headingsOffset?: number,
  dark?: boolean,
  theme?: Object,
  uploadImage?: (file: File) => Promise<string>,
  onSave?: ({ done?: boolean }) => void,
  onCancel?: () => void,
  onChange: (value: () => string) => void,
  onImageUploadStart?: () => void,
  onImageUploadStop?: () => void,
  onSearchLink?: (term: string) => Promise<SearchResult[]>,
  onClickLink?: (href: string) => void,
  onClickHashtag?: (tag: string) => void,
  onShowToast?: (message: string) => void,
  getLinkComponent?: Node => ?React.ComponentType<any>,
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
      new CheckboxList(),
      new CheckboxItem(),
      new Heading(),
      new HorizontalRule(),
      new Image(),
      new ListItem(),
      // new HardBreak(), // must come after ListItem for correct Enter behavior
      new Bold(),
      new Code(),
      new Italic(),
      new Link(),
      new Strikethrough(),
      new OrderedList(),
      new Placeholder(),
      new History(),
      new SmartText(),
      new TrailingNode({
        node: "paragraph",
        notAfter: ["paragraph", "heading"],
      }),
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
  pasteRules: InputRule[];
  nodes: { string: Node };
  marks: { string: Mark };
  commands: Object;

  componentDidMount() {
    this.init();
    this.scrollToAnchor();

    if (this.props.readOnly) return;

    // if (this.props.autoFocus) {
    //   this.view.focus();
    // }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.setProps({
        editable: () => !this.props.readOnly,
      });
    }
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
    this.pasteRules = this.createPasteRules();
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

  createPasteRules() {
    return this.extensions.pasteRules({
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

  createState() {
    const doc = this.createDocument(this.props.defaultValue);

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
        ...this.pasteRules,
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

  handleDrop = async (ev: SyntheticDragEvent<>) => {
    // if (this.props.readOnly) return;
    // // check an image upload callback is defined
    // if (!this.editor.props.uploadImage) return;
    // // check if this event was already handled by the Editor
    // if (ev.isDefaultPrevented()) return;
    // // otherwise we'll handle this
    // ev.preventDefault();
    // ev.stopPropagation();
    // const files = getDataTransferFiles(ev);
    // for (let i = 0; i < files.length; i++) {
    //   const file = files[i];
    //   if (file.type.startsWith("image/")) {
    //     await this.insertImageFile(file);
    //   }
    // }
  };

  insertImageFile = (file: window.File) => {
    // this.editor.insertImageFile(file);
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
    // const { editor } = this;
    // editor.moveToStartOfDocument().focus();
  };

  focusAtEnd = () => {
    // const { editor } = this;
    // editor.moveToEndOfDocument().focus();
  };

  render = () => {
    const { dark, readOnly, style, className } = this.props;
    const theme = this.props.theme || (dark ? darkTheme : lightTheme);

    return (
      <Flex
        style={style}
        className={className}
        onDrop={this.handleDrop}
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
  }

  ul.checkbox_list li.checked {
    color: ${props => props.theme.textSecondary};
    text-decoration: line-through;
  }

  li p {
    display: inline;
    margin: 0;
  }

  code {
    border-radius: 4px;
    border: 1px solid ${props => props.theme.codeBorder};
    padding: 3px 6px;
    font-family: "Source Code Pro", Menlo, monospace;
    font-size: 85%;
  }
`;

export default RichMarkdownEditor;
