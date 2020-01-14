// @flow
import { ellipsis, emDash, smartQuotes } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

export default class SmartText extends Extension {
  get name() {
    return "smart_text";
  }

  inputRules() {
    return [ellipsis, emDash, ...smartQuotes];
  }
}
