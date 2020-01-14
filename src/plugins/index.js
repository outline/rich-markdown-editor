// @flow
import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
// import { menuBar } from "prosemirror-menu";

import { buildMenuItems } from "./menu";
import { buildOnChange } from "./onChange";
import { buildKeymap } from "./keymap";
import { buildInputRules } from "./inputrules";

export { buildMenuItems, buildKeymap, buildInputRules };

export default function plugins(options: Object) {
  return [
    buildOnChange(options),
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    // menuBar({
    //   floating: true,
    //   content: options.menuContent || buildMenuItems(options.schema).fullMenu,
    // }),
    history(),
  ];
}
