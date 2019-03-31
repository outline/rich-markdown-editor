// @flow
import * as React from "react";
import { Editor } from "slate";
import Contents from "../components/Contents";
import Toolbar from "../components/Toolbar";
import BlockInsert from "../components/BlockInsert";
import type { Props } from "../";

function ChromePlugin() {
  function renderEditor(props: Props, editor: Editor, next: () => React.Node) {
    const children = next();

    return (
      <React.Fragment>
        {!props.readOnly && <Toolbar value={editor.value} editor={editor} />}
        {!props.readOnly && <BlockInsert editor={editor} />}
        {props.toc && <Contents editor={editor} />}
        {children}
      </React.Fragment>
    );
  }

  return { renderEditor };
}

export default ChromePlugin;
