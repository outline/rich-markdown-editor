// @flow
import React from "react";
import ReactDOM from "react-dom";
import Editor from "../../src";

const element = document.getElementById("main");
const noop = () => {};
const text = `
# Welcome

This is example content
`;

if (element) {
  ReactDOM.render(
    <Editor
      text={text}
      readOnly={false}
      onSave={noop}
      onChange={noop}
      onCancel={noop}
      onImageUploadStart={noop}
      onImageUploadStop={noop}
    />,
    element
  );
}
