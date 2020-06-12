import * as React from "react";
import { EditorState } from "prosemirror-state";

export type MenuItem = {
  icon?: typeof React.Component;
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
  component: typeof React.Component;
};
