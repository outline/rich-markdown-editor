// @flow

export default {
  title: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "h1", attrs: { level: 1 } }],
    toDOM(node) {
      return ["h1", 0];
    },
  },
};
