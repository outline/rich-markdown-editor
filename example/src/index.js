// @flow
import React from "react";
import ReactDOM from "react-dom";
import Editor from "../../src";

const element = document.getElementById("main");
const savedText = localStorage.getItem("saved");
const exampleText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const defaultValue = savedText || exampleText;

if (element) {
  ReactDOM.render(
    <Editor
      style={{ marginTop: "60px" }}
      defaultValue={defaultValue}
      onSave={() => console.log("Save triggered")}
      onCancel={() => console.log("Cancel triggered")}
      onChange={text => localStorage.setItem("saved", text)}
      onClickLink={href => console.log("Clicked link: ", href)}
      uploadImage={async file => {
        console.log("File upload triggered: ", file);
        return "";
      }}
    />,
    element
  );
}
