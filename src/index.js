// @flow
import * as React from "react";
import { EditorState, PluginKey, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser, DOMSerializer } from "prosemirror-model";
import {
  schema,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import styled, { ThemeProvider } from "styled-components";
import setup from "./setup";
import type { Plugin, SearchResult, Serializer } from "./types";
import { light as lightTheme, dark as darkTheme } from "./theme";
import defaultSchema from "./schema";
import getDataTransferFiles from "./lib/getDataTransferFiles";
import isModKey from "./lib/isModKey";
import Flex from "./components/Flex";
import Markdown from "./serializer";
import createPlugins from "./plugins";
import commands from "./commands";
import queries from "./queries";

export const theme = lightTheme;
// export const schema = defaultSchema;

const defaultOptions = {};

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
  schema?: Schema,
  serializer?: Serializer,
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

type State = {
  editorValue: Value,
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    placeholder: "Write something nice…",
    onImageUploadStart: () => {},
    onImageUploadStop: () => {},
    plugins: [],
    tooltip: "span",
  };

  element: HTMLElement;
  view: EditorView;
  plugins: Plugin[];
  serializer: Serializer;
  prevSchema: ?Schema = null;
  schema: ?Schema = null;

  constructor(props: Props) {
    super(props);

    const builtInPlugins = createPlugins({
      placeholder: props.placeholder,
      getLinkComponent: props.getLinkComponent,
    });

    // in Slate plugins earlier in the stack can opt not to continue
    // to later ones. By adding overrides first we give more control
    this.plugins = [...props.plugins, ...builtInPlugins];

    this.serializer = props.serializer || Markdown;

    this.state = {
      editorValue: this.serializer.deserialize(props.defaultValue),
    };
  }

  componentDidMount() {
    this.scrollToAnchor();

    if (this.props.readOnly) return;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyDown);
    }

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }

    if (this.element) {
      this.view = new EditorView(this.element, {
        state: EditorState.create({
          doc: defaultMarkdownParser.parse(this.props.defaultValue),
          plugins: setup({ schema }),
        }),
      });
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

  setEditorRef = (ref: Editor) => {
    this.editor = ref;
  };

  value = (): string => {
    return this.serializer.serialize(this.state.editorValue);
  };

  handleChange = ({ value }: { value: Value }) => {
    this.setState({ editorValue: value }, state => {
      if (this.props.onChange && !this.props.readOnly) {
        this.props.onChange(this.value);
      }
    });
  };

  handleDrop = async (ev: SyntheticDragEvent<>) => {
    if (this.props.readOnly) return;

    // check an image upload callback is defined
    if (!this.editor.props.uploadImage) return;

    // check if this event was already handled by the Editor
    if (ev.isDefaultPrevented()) return;

    // otherwise we'll handle this
    ev.preventDefault();
    ev.stopPropagation();

    const files = getDataTransferFiles(ev);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        await this.insertImageFile(file);
      }
    }
  };

  insertImageFile = (file: window.File) => {
    this.editor.insertImageFile(file);
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
    if (this.props.readOnly) return next();

    switch (ev.key) {
      case "s":
        if (isModKey(ev)) return this.onSave(ev);
        break;
      case "Enter":
        if (isModKey(ev)) return this.onSaveAndExit(ev);
        break;
      case "Escape":
        if (isModKey(ev)) return this.onCancel(ev);
        break;
      default:
    }

    return next();
  };

  focusAtStart = () => {
    // const { editor } = this;
    // editor.moveToStartOfDocument().focus();
  };

  focusAtEnd = () => {
    // const { editor } = this;
    // editor.moveToEndOfDocument().focus();
  };

  getSchema = () => {
    if (this.prevSchema !== this.props.schema) {
      this.schema = {
        ...defaultSchema,
        ...(this.props.schema || {}),
      };
      this.prevSchema = this.props.schema;
    }
    return this.schema;
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
          {/* <StyledEditor
            ref={this.setEditorRef}
            plugins={this.plugins}
            value={this.state.editorValue}
            commands={commands}
            queries={queries}
            placeholder={placeholder}
            schema={this.getSchema()}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            onSave={onSave}
            onSearchLink={onSearchLink}
            onClickLink={onClickLink}
            onImageUploadStart={onImageUploadStart}
            onImageUploadStop={onImageUploadStop}
            onShowToast={onShowToast}
            readOnly={readOnly}
            spellCheck={!readOnly}
            uploadImage={uploadImage}
            pretitle={pretitle}
            options={defaultOptions}
            {...rest}
          /> */}
          <div ref={ref => (this.element = ref)} />
        </ThemeProvider>
      </Flex>
    );
  };
}

// const StyledEditor = styled(Editor)`
//   color: ${props => props.theme.text};
//   background: ${props => props.theme.background};
//   font-family: ${props => props.theme.fontFamily};
//   font-weight: ${props => props.theme.fontWeight};
//   font-size: 1em;
//   line-height: 1.7em;
//   width: 100%;

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
