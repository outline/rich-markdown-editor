// @flow
import Extension from "../lib/Extension";

export default class Keys extends Extension {
  get name() {
    return "keys";
  }

  keys() {
    return {
      "Mod-s": (state, dispatch) => this.options.onSave(state, dispatch),
    };
  }
}
