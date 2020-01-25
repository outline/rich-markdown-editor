// @flow
import Node from "./Node";

export default class Paste extends Node {
  get name() {
    return "paste";
  }

  get schema() {
    return {
      content: "block+",
    };
  }
}
