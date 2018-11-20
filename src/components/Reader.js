// @flow
import * as React from "react";
import renderMark from "../marks";
import renderNode from "../nodes";

let serializeNode, serializeLeaf, serializeString, addKey;
let key = 0;

const toReact = (props, options = {}) => {
  const editor = { value: props.value, props };
  const { document } = props.value;
  const elements = document.nodes
    .map(n => serializeNode(n, editor))
    .filter(Boolean);
  return elements;
};

serializeNode = (node, editor) => {
  if (node.object === "text") {
    const { leaves } = node;
    return leaves.map(serializeLeaf);
  }

  const children = node.nodes.map(serializeNode);
  return renderNode({ editor, node, children, readOnly: true, key: key++ });
};

serializeLeaf = leaf => {
  const string = { object: "string", text: leaf.text };
  const text = serializeString(string);

  return leaf.marks.reduce((children, mark) => {
    return renderMark({ mark, children, key: key++ });
  }, text);
};

serializeString = string => {
  return string.text.split("\n").reduce((array, text, i) => {
    if (i !== 0) array.push(<br key={i} />);
    array.push(text);
    return array;
  }, []);
};

export default toReact;
