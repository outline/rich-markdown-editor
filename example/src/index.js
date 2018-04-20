// @flow
import React from "react";
import ReactDOM from "react-dom";
import Editor from "../../src";

const element = document.getElementById("main");
const noop = () => {};
const previousText = localStorage.getItem("saved");
const defaultText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const text = previousText || defaultText;

if (element) {
  ReactDOM.render(
    <Editor
      text={text}
      readOnly={false}
      onSave={noop}
      onChange={text => localStorage.setItem("saved", text)}
      onCancel={noop}
      onImageUploadStart={noop}
      onImageUploadStop={noop}
    />,
    element
  );
}
