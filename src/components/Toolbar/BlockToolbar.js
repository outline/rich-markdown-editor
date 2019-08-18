// @flow
import * as React from "react";
import { findDOMNode } from "react-dom";
import keydown from "react-keydown";
import styled, { withTheme } from "styled-components";
import {
  Heading1Icon,
  Heading2Icon,
  BlockQuoteIcon,
  ImageIcon,
  CodeIcon,
  BulletedListIcon,
  OrderedListIcon,
  HorizontalRuleIcon,
  TodoListIcon,
  TableIcon,
} from "outline-icons";
import getDataTransferFiles from "../../lib/getDataTransferFiles";
import type { SlateNodeProps, Theme } from "../../types";
import EditList from "../../plugins/EditList";
import ToolbarButton from "./ToolbarButton";

const { changes } = EditList;

type Props = SlateNodeProps & {
  theme: Theme,
};

type Options = {
  type: string | Object,
  wrapper?: string | Object,
};

class BlockToolbar extends React.Component<Props> {
  bar: ?HTMLDivElement;
  file: ?HTMLInputElement;

  componentDidMount() {
    if (typeof window !== "undefined") {
      window.addEventListener("click", this.handleOutsideMouseClick);
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("click", this.handleOutsideMouseClick);
    }
  }

  handleOutsideMouseClick = (ev: SyntheticMouseEvent<>) => {
    const element = findDOMNode(this.bar);

    if (
      !element ||
      (ev.target instanceof Node && element.contains(ev.target)) ||
      (ev.button && ev.button !== 0)
    ) {
      return;
    }
    this.removeSelf(ev);
  };

  @keydown("esc")
  removeSelf(ev: SyntheticEvent<*>) {
    ev.preventDefault();
    ev.stopPropagation();

    this.props.editor.setNodeByKey(this.props.node.key, {
      type: "paragraph",
      text: "",
      isVoid: false,
    });
  }

  insertBlock = (
    options: Options,
    cursorPosition: "before" | "on" | "after" = "on"
  ) => {
    const { editor } = this.props;

    editor.moveToEndOfNode(this.props.node);

    if (options.type === "table") {
      editor.insertTable(3, 3).moveSelection(0, 0);
    } else {
      editor.insertBlock(options.type);
    }

    editor.removeNodeByKey(this.props.node.key).moveToEnd();

    if (cursorPosition === "before") editor.moveToStartOfPreviousBlock();
    if (cursorPosition === "after") editor.moveToStartOfNextBlock();
    return editor.focus();
  };

  insertList = (type: string) => {
    const { editor } = this.props;
    const checked = type === "todo-list" ? false : undefined;

    this.props.editor.setNodeByKey(this.props.node.key, {
      type: "paragraph",
      text: "",
      isVoid: false,
    });

    return editor
      .moveToEndOfNode(this.props.node)
      .command(changes.wrapInList, type, undefined, {
        type: "list-item",
        data: { checked },
      })
      .focus();
  };

  handleClickBlock = (ev: SyntheticEvent<*>, type: string) => {
    ev.preventDefault();
    ev.stopPropagation();

    switch (type) {
      case "heading1":
      case "heading2":
      case "block-quote":
      case "table":
      case "code":
        return this.insertBlock({ type });
      case "horizontal-rule":
        return this.insertBlock(
          {
            type: { type: "horizontal-rule", isVoid: true },
          },
          "after"
        );
      case "bulleted-list":
        return this.insertList("bulleted-list");
      case "ordered-list":
        return this.insertList("ordered-list");
      case "todo-list":
        return this.insertList("todo-list");
      case "image":
        return this.onPickImage();
      default:
    }
  };

  onPickImage = () => {
    // simulate a click on the file upload input element
    if (this.file) this.file.click();
  };

  onImagePicked = async (ev: SyntheticInputEvent<*>) => {
    const files = getDataTransferFiles(ev);
    const { editor } = this.props;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      editor.insertImageFile(file);
    }
  };

  renderBlockButton = (type: string, IconClass: Function, tooltip: string) => {
    const { hiddenToolbarButtons } = this.props.theme;
    const Tooltip = this.props.editor.props.tooltip;

    if (
      hiddenToolbarButtons &&
      hiddenToolbarButtons.blocks &&
      hiddenToolbarButtons.blocks.includes(type)
    ) {
      return null;
    }

    return (
      <ToolbarButton onMouseDown={ev => this.handleClickBlock(ev, type)}>
        <Tooltip tooltip={tooltip} placement="top">
          <IconClass color={this.props.theme.blockToolbarItem} />
        </Tooltip>
      </ToolbarButton>
    );
  };

  render() {
    const { editor, attributes } = this.props;
    const hasImageUpload = !!editor.props.uploadImage;

    return (
      <Bar {...attributes} ref={ref => (this.bar = ref)}>
        {this.renderBlockButton("heading1", Heading1Icon, "Add heading")}
        {this.renderBlockButton("heading2", Heading2Icon, "Add subheading")}
        <Separator />
        {this.renderBlockButton(
          "bulleted-list",
          BulletedListIcon,
          "Start bulleted list"
        )}
        {this.renderBlockButton(
          "ordered-list",
          OrderedListIcon,
          "Start numbered List"
        )}
        {this.renderBlockButton("todo-list", TodoListIcon, "Start checklist")}
        <Separator />
        {this.renderBlockButton("table", TableIcon, "Create table")}
        {this.renderBlockButton("block-quote", BlockQuoteIcon, "Add quote")}
        {this.renderBlockButton("code", CodeIcon, "Add code")}
        {this.renderBlockButton(
          "horizontal-rule",
          HorizontalRuleIcon,
          "Add break"
        )}
        {hasImageUpload &&
          this.renderBlockButton("image", ImageIcon, "Add image")}
        <HiddenInput
          type="file"
          ref={ref => (this.file = ref)}
          onChange={this.onImagePicked}
          accept="image/*"
        />
      </Bar>
    );
  }
}

const Separator = styled.div`
  height: 100%;
  width: 1px;
  background: rgba(0, 0, 0, 0.1);
  display: inline-block;
  margin-left: 10px;
`;

const Bar = styled.div`
  display: flex;
  z-index: ${props => {
    return props.theme.zIndex;
  }};
  position: relative;
  align-items: center;
  background: ${props => props.theme.blockToolbarBackground};
  height: 44px;

  &:before,
  &:after {
    content: "";
    position: absolute;
    left: -100%;
    width: 100%;
    height: 44px;
    background: ${props => props.theme.blockToolbarBackground};
  }

  &:after {
    left: auto;
    right: -100%;
  }

  @media print {
    display: none;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  top: -100px;
  left: -100px;
  visibility: hidden;
`;

export default withTheme(BlockToolbar);
