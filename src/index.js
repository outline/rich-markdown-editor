// @flow
import * as React from "react";
import { Value, Change, Schema, Text } from "slate";
import { Editor } from "slate-react";
import styled from "react-emotion";
import { ThemeProvider } from "emotion-theming";
import type { SlateNodeProps, Plugin, SearchResult } from "./types";
import { light as lightTheme, dark as darkTheme } from "./theme";
import defaultSchema from "./schema";
import getDataTransferFiles from "./lib/getDataTransferFiles";
import isModKey from "./lib/isModKey";
import Flex from "./components/Flex";
import Toolbar from "./components/Toolbar";
import BlockInsert from "./components/BlockInsert";
import InternalPlaceholder from "./components/Placeholder";
import Contents from "./components/Contents";
import Markdown from "./serializer";
import createPlugins from "./plugins";
import { insertImageFile } from "./changes";
import renderMark from "./marks";
import renderNode from "./nodes";

export const theme = lightTheme;
export const schema = defaultSchema;
export const Placeholder = InternalPlaceholder;

type Props = {
  defaultValue: string,
  placeholder: string,
  pretitle?: string,
  plugins?: Plugin[],
  readOnly?: boolean,
  toc?: boolean,
  dark?: boolean,
  schema?: Schema,
  theme?: Object,
  uploadImage?: (file: File) => Promise<string>,
  onSave: ({ done?: boolean }) => *,
  onCancel: () => *,
  onChange: string => *,
  onImageUploadStart: () => *,
  onImageUploadStop: () => *,
  onSearchLink?: (term: string) => Promise<SearchResult[]>,
  onClickLink?: (href: string) => *,
  onShowToast?: (message: string) => *,
  renderNode?: SlateNodeProps => ?React.Node,
  renderPlaceholder?: SlateNodeProps => ?React.Node,
  className?: string,
  style?: Object,
};

type State = {
  editorValue: Value,
  editorLoaded: boolean,
  schema: Schema,
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    placeholder: "Write something nice…",
    onImageUploadStart: () => {},
    onImageUploadStop: () => {},
  };

  editor: Editor;
  plugins: Plugin[];

  constructor(props: Props) {
    super(props);

    this.plugins = createPlugins();
    if (props.plugins) {
      this.plugins = this.plugins.concat(props.plugins);
    }
    this.state = {
      editorLoaded: false,
      editorValue: Markdown.deserialize(props.defaultValue),
      schema: {
        ...defaultSchema,
        ...this.props.schema,
      },
    };
  }

  componentDidMount() {
    if (this.props.readOnly) return;
    window.addEventListener("keydown", this.handleKeyDown);

    if (!this.props.defaultValue) {
      this.focusAtStart();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.schema !== this.props.schema) {
      this.setState({
        schema: {
          ...defaultSchema,
          ...nextProps.schema,
        },
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.readOnly && !this.props.readOnly) {
      this.focusAtEnd();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  setEditorRef = (ref: Editor) => {
    this.editor = ref;
    // Force re-render to show ToC (<Content />)
    this.setState({ editorLoaded: true });
  };

  handleChange = (change: Change) => {
    if (this.state.editorValue !== change.value) {
      if (this.props.onChange && !this.props.readOnly) {
        this.props.onChange(Markdown.serialize(change.value));
      }

      this.setState({ editorValue: change.value });
    }
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
    this.editor.change(change =>
      change.call(insertImageFile, file, this.editor)
    );
  };

  cancelEvent = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();
  };

  onSave(ev: SyntheticKeyboardEvent<*>) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onSave({ done: false });
  }

  onSaveAndExit(ev: SyntheticKeyboardEvent<*>) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onSave({ done: true });
  }

  onCancel(ev: SyntheticKeyboardEvent<*>) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onCancel();
  }

  handleKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (this.props.readOnly) return;

    switch (ev.key) {
      case "s":
        if (isModKey(ev)) this.onSave(ev);
        return;
      case "Enter":
        if (isModKey(ev)) this.onSaveAndExit(ev);
        return;
      case "Escape":
        if (isModKey(ev)) this.onCancel(ev);
        return;
      default:
    }
  };

  focusAtStart = () => {
    this.editor.change(change =>
      change.collapseToStartOf(change.value.document).focus()
    );
  };

  focusAtEnd = () => {
    this.editor.change(change =>
      change.collapseToEndOf(change.value.document).focus()
    );
  };

  renderNode = (props: SlateNodeProps) => {
    const node = this.props.renderNode && this.props.renderNode(props);
    if (node) return node;

    return renderNode(props);
  };

  renderPlaceholder = (props: SlateNodeProps) => {
    if (this.props.renderPlaceholder) {
      return this.props.renderPlaceholder(props);
    }
    const { editor, node } = props;

    if (!editor.props.placeholder) return;
    if (editor.state.isComposing) return;
    if (node.object !== "block") return;
    if (!Text.isTextList(node.nodes)) return;
    if (node.text !== "") return;
    if (editor.value.document.getBlocks().size > 1) return;

    return (
      <Placeholder>
        {editor.props.readOnly ? "" : editor.props.placeholder}
      </Placeholder>
    );
  };

  render = () => {
    const {
      readOnly,
      toc,
      pretitle,
      placeholder,
      onSave,
      uploadImage,
      onSearchLink,
      onClickLink,
      onImageUploadStart,
      onImageUploadStop,
      onShowToast,
      className,
      style,
      dark,
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
            {readOnly &&
              toc &&
              this.state.editorLoaded &&
              this.editor && <Contents editor={this.editor} />}
            {!readOnly &&
              this.editor && (
                <Toolbar value={this.state.editorValue} editor={this.editor} />
              )}
            {!readOnly &&
              this.editor && (
                <BlockInsert
                  editor={this.editor}
                  onInsertImage={this.insertImageFile}
                />
              )}
            <StyledEditor
              innerRef={this.setEditorRef}
              plugins={this.plugins}
              value={this.state.editorValue}
              placeholder={placeholder}
              renderPlaceholder={this.renderPlaceholder}
              renderNode={this.renderNode}
              renderMark={renderMark}
              schema={this.state.schema}
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
            />
          </React.Fragment>
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
