// @flow

export default {
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ["div", ["hr"]];
    },
  },
};
