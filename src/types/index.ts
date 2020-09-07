import * as React from "react";
import { EditorState } from "prosemirror-state";

export type ToastId =
  | "code_copied"
  | "embed_invalid_link"
  | "heading_copied"
  | "image_upload_error"
  | "link_create_error";

export type MenuItem = {
  icon?: typeof React.Component | React.FC<any>;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  attrs?: Record<string, any>;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
};

export type EmbedDescriptor = MenuItem & {
  matcher: (url: string) => boolean | [];
  component: typeof React.Component | React.FC<any>;
};
