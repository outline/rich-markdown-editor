// @flow
import * as React from "react";
import { debounce } from "lodash";
import ReactDOM from "react-dom";
import Editor from "../../src";
import Serializer from "../../src/serializer";

const element = document.getElementById("main");
const savedText = localStorage.getItem("saved");

const exampleText = `
# Welcome
This is example content. It is persisted between reloads in localStorage.
`;

const valuePropText = `Brand new text passed through value prop`;

const defaultValue = savedText || exampleText;

class GoogleEmbed extends React.Component<*> {
  render() {
    const { attributes, node } = this.props;
    return <p {...attributes}>Google Embed ({node.data.get("href")})</p>;
  }
}

class Example extends React.Component<*, { readOnly: boolean, dark: boolean }> {
  state = {
    readOnly: false,
    dark: localStorage.getItem("dark") === "enabled",
  };

  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };

  handleToggleDark = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    localStorage.setItem("dark", dark ? "enabled" : "disabled");
  };

  handleChange = debounce(value => {
    localStorage.setItem("saved", value());
    console.log(localStorage);
  }, 250);

  render() {
    const { body } = document;
    if (body) body.style.backgroundColor = this.state.dark ? "#181A1B" : "#FFF";

    return (
      <div style={{ marginTop: "60px" }}>
        <p>
          <button type="button" onClick={this.handleToggleReadOnly}>
            {this.state.readOnly ? "Editable" : "Read Only"}
          </button>
          <button type="button" onClick={this.handleToggleDark}>
            {this.state.dark ? "Light Theme" : "Dark Theme"}
          </button>
        </p>
        <Editor
          id="example"
          readOnly={this.state.readOnly}
          value={Serializer.deserialize(valuePropText)}
          defaultValue={defaultValue}
          onSave={options => console.log("Save triggered", options)}
          onCancel={() => console.log("Cancel triggered")}
          onChange={this.handleChange}
          onClickLink={href => console.log("Clicked link: ", href)}
          onClickHashtag={tag => console.log("Clicked hashtag: ", tag)}
          onShowToast={message => window.alert(message)}
          onSearchLink={async term => {
            console.log("Searched link: ", term);
            return [
              {
                title: term,
                url: "localhost",
              },
            ];
          }}
          uploadImage={file => {
            console.log("File upload triggered: ", file);

            // Delay to simulate time taken to upload
            return new Promise(resolve => {
              setTimeout(() => resolve("http://lorempixel.com/400/200/"), 1500);
            });
          }}
          getLinkComponent={node => {
            if (node.data.get("href").match(/google/)) {
              return GoogleEmbed;
            }
          }}
          dark={this.state.dark}
          autoFocus
          toc
        />
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<Example />, element);
}