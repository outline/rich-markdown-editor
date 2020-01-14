// @flow
import * as React from "react";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import type { SearchResult } from "./types";
import { light as lightTheme, dark as darkTheme } from "./theme";
import Flex from "./components/Flex";
import ExtensionManager from "./lib/ExtensionManager";

// nodes
import Node from "./nodes/Node";
import Blockquote from "./nodes/Blockquote";
import Doc from "./nodes/Doc";
import HorizontalRule from "./nodes/HorizontalRule";
import Text from "./nodes/Text";
import Paragraph from "./nodes/Paragraph";
import Heading from "./nodes/Heading";

// marks
import Mark from "./marks/Mark";
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Italic from "./marks/Italic";

// plugins
import History from "./plugins/History";
import Change from "./plugins/Change";
import Placeholder from "./plugins/Placeholder";
import SmartText from "./plugins/SmartText";

export const theme = lightTheme;

export type Props = {
  id?: string,
  defaultValue: string,
  placeholder: string,
  pretitle?: string,
  plugins: Plugin[],
  autoFocus?: boolean,
  readOnly?: boolean,
  headingsOffset?: number,
  toc?: boolean,
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
    plugins: [],
    tooltip: "span",
  };

  extensions: ExtensionManager;
  element: HTMLElement;
  view: EditorView;
  schema: Schema;
  serializer: MarkdownSerializer;
  parser: MarkdownParser;
  plugins: Plugin[];
  nodes: { string: Node };
  marks: { string: Mark };

  componentDidMount() {
    this.init();
    this.scrollToAnchor();

    if (this.props.readOnly) return;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyDown);
    }

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyDown);
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
    this.view = this.createView();
    this.commands = this.createCommands();
  }

  createExtensions() {
    return new ExtensionManager([
      new Doc(),
      new Text(),
      new Paragraph(),
      new Heading(),
      new Blockquote(),
      new HorizontalRule(),
      new Bold(),
      new Code(),
      new Italic(),
      new Placeholder(),
      new History(),
      new SmartText(),
      new Change({ onChange: this.handleChange }),
    ]);
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
    return EditorState.create({
      schema: this.schema,
      doc: this.createDocument(this.props.defaultValue),
      plugins: [
        ...this.plugins,
        inputRules({
          rules: this.inputRules,
        }),
        keymap(baseKeymap),
        ...this.pasteRules,
        ...this.keymaps,
      ],
    });
  }

  createDocument(content: string) {
    return this.parser.parse(content);
  }

  createView() {
    return new EditorView(this.element, {
      state: this.createState(),
    });
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
      this.props.onChange(this.value);
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

  onSave(ev: SyntheticKeyboardEvent<>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: false });
    }
  }

  onSaveAndExit(ev: SyntheticKeyboardEvent<>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: true });
    }
  }

  onCancel(ev: SyntheticKeyboardEvent<>) {
    const { onCancel } = this.props;
    if (onCancel) {
      ev.preventDefault();
      ev.stopPropagation();
      onCancel();
    }
  }

  handleKeyDown = (
    ev: SyntheticKeyboardEvent<>,
    editor: TEditor,
    next: Function = () => {}
  ) => {
    // if (this.props.readOnly) return next();
    // switch (ev.key) {
    //   case "s":
    //     if (isModKey(ev)) return this.onSave(ev);
    //     break;
    //   case "Enter":
    //     if (isModKey(ev)) return this.onSaveAndExit(ev);
    //     break;
    //   case "Escape":
    //     if (isModKey(ev)) return this.onCancel(ev);
    //     break;
    //   default:
    // }
    // return next();
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
    const {
      readOnly,
      pretitle,
      placeholder,
      onSave,
      onChange,
      onCancel,
      uploadImage,
      onSearchLink,
      onClickLink,
      onImageUploadStart,
      onImageUploadStop,
      onShowToast,
      className,
      style,
      dark,
      defaultValue,
      autoFocus,
      plugins,
      ...rest
    } = this.props;

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
            <ProsemirrorStyles />
            <StyledEditor ref={ref => (this.element = ref)} />
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  };
}

const ProsemirrorStyles = createGlobalStyle`
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

  .ProseMirror .placeholder {
    &:before {
      display: block;
      content: attr(data-empty-text);
      pointer-events: none;
      height: 0;
      color: ${props => props.theme.placeholder};
    }
  }

  .ProseMirror pre {
    white-space: pre-wrap;
  }

  .ProseMirror li {
    position: relative;
  }

  .ProseMirror-hideselection *::selection { background: transparent; }
  .ProseMirror-hideselection *::-moz-selection { background: transparent; }
  .ProseMirror-hideselection { caret-color: transparent; }

  .ProseMirror-selectednode {
    outline: 2px solid #8cf;
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: "";
    position: absolute;
    left: -32px;
    right: -2px; top: -2px; bottom: -2px;
    border: 2px solid #8cf;
    pointer-events: none;
  }
`;

const StyledEditor = styled("div")`
  color: ${props => props.theme.text};
  background: ${props => props.theme.background};
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;
`;

//   h1,
//   h2,
//   h3,
//   h4,
//   h5,
//   h6 {
//     font-weight: 500;
//   }

//   ul,
//   ol {
//     margin: 0 0.1em;
//     padding-left: 1em;

//     ul,
//     ol {
//       margin: 0.1em;
//     }
//   }

//   p {
//     position: relative;
//     margin: 0;
//   }

//   a {
//     color: ${props => props.theme.link};
//   }

//   a:hover {
//     text-decoration: ${props => (props.readOnly ? "underline" : "none")};
//   }

//   li p {
//     display: inline;
//     margin: 0;
//   }

//   .todoList {
//     list-style: none;
//     padding-left: 0;

//     .todoList {
//       padding-left: 1em;
//     }
//   }

//   .todo {
//     span:last-child:focus {
//       outline: none;
//     }
//   }

//   blockquote {
//     border-left: 3px solid ${props => props.theme.quote};
//     margin: 0;
//     padding-left: 10px;
//     font-style: italic;
//   }

//   b,
//   strong {
//     font-weight: 600;
//   }
// `;

export default RichMarkdownEditor;
