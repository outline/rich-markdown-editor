// @flow
import * as React from "react";
import { Value, Editor as TEditor, Schema, Node } from "slate";
import { Editor } from "slate-react";
import styled, { ThemeProvider } from "styled-components";
import type { Plugin, SearchResult } from "./types";
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
export const schema = defaultSchema;

const defaultOptions = { normalize: false };

export type Props = {
  id?: string,
  defaultValue: string,
  placeholder: string,
  pretitle?: string,
  plugins: Plugin[],
  autoFocus?: boolean,
  readOnly?: boolean,
  toc?: boolean,
  dark?: boolean,
  schema?: Schema,
  theme?: Object,
  uploadImage?: (file: File) => Promise<string>,
  onSave?: ({ done?: boolean }) => *,
  onCancel?: () => *,
  onChange: (value: () => string) => *,
  onImageUploadStart?: () => *,
  onImageUploadStop?: () => *,
  onSearchLink?: (term: string) => Promise<SearchResult[]>,
  onClickLink?: (href: string) => *,
  onShowToast?: (message: string) => *,
  getLinkComponent?: Node => ?React.ComponentType<*>,
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
  };

  editor: Editor;
  plugins: Plugin[];
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

    this.state = {
      editorValue: Markdown.deserialize(props.defaultValue),
    };
  }

  componentDidMount() {
    this.scrollToAnchor();

    if (this.props.readOnly) return;
    typeof window !== "undefined" && window.addEventListener("keydown", this.handleKeyDown);

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
    typeof window !== "undefined" && window.removeEventListener("keydown", this.handleKeyDown);
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
    return Markdown.serialize(this.state.editorValue);
  };

  handleChange = ({ value }: { value: Value }) => {
    this.setState({ editorValue: value }, state => {
      if (this.props.onChange && !this.props.readOnly) {
        this.props.onChange(this.value);
      }
    });
  };

  handleDrop = async (ev: SyntheticDragEvent<*>) => {
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

  cancelEvent = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();
  };

  onSave(ev: SyntheticKeyboardEvent<*>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: false });
    }
  }

  onSaveAndExit(ev: SyntheticKeyboardEvent<*>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: true });
    }
  }

  onCancel(ev: SyntheticKeyboardEvent<*>) {
    const { onCancel } = this.props;
    if (onCancel) {
      ev.preventDefault();
      ev.stopPropagation();
      onCancel();
    }
  }

  handleKeyDown = (
    ev: SyntheticKeyboardEvent<*>,
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
    const { editor } = this;
    editor.moveToStartOfDocument().focus();
  };

  focusAtEnd = () => {
    const { editor } = this;
    editor.moveToEndOfDocument().focus();
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
          <StyledEditor
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
          />
        </ThemeProvider>
      </Flex>
    );
  };
}

const StyledEditor = styled(Editor)`
  background: ${props => props.theme.background};
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;
  color: ${props => props.theme.text};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 500;
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

  li p {
    display: inline;
    margin: 0;
  }

  .todoList {
    list-style: none;
    padding-left: 0;

    .todoList {
      padding-left: 1em;
    }
  }

  .todo {
    span:last-child:focus {
      outline: none;
    }
  }

  blockquote {
    border-left: 3px solid ${props => props.theme.quote};
    margin: 0;
    padding-left: 10px;
    font-style: italic;
  }

  table {
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: bold;
  }

  th,
  td {
    padding: 5px 20px 5px 0;
  }

  b,
  strong {
    font-weight: 600;
  }
`;

export default RichMarkdownEditor;
