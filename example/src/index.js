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
const autoWriteTemplate = `Document has been restarted with a template!`;

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
    autoWrite: false,
    dark: localStorage.getItem("dark") === "enabled",
  };


  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };

  handleToggleAutoWrite = () => {
    if (!this.state.readOnly) {
      this.setState({ autoWrite: !this.state.autoWrite });
    }
  }

  handleToggleDark = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    localStorage.setItem("dark", dark ? "enabled" : "disabled");
  };

  handleChange = debounce(value => {
    localStorage.setItem("saved", value());
  }, 250);

  render() {
    const { body } = document;
    if (body) body.style.backgroundColor = this.state.dark ? "#181A1B" : "#FFF";

    if (!this.state.autoWrite) {
      console.log("NOT Auto Write");
      return (
        <div key={1} style={{ marginTop: "60px" }}>
          <p>
            <button type="button" onClick={this.handleToggleReadOnly}>
              {this.state.readOnly ? "Editable" : "Read Only"}
            </button>
            <button type="button" onClick={this.handleToggleAutoWrite}>
              Auto Write
            </button>
            <button type="button" onClick={this.handleToggleDark}>
              {this.state.dark ? "Light Theme" : "Dark Theme"}
            </button>
          </p>
          <Editor
            id="example"
            readOnly={this.state.readOnly}
            autoWrite={this.state.autoWrite}
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
    } else {
      return (
        <div key={2} style={{ marginTop: "60px" }}>
          <p>
            <button type="button" onClick={this.handleToggleReadOnly}>
              {this.state.readOnly ? "Editable" : "Read Only"}
            </button>
            <button type="button" onClick={this.handleToggleAutoWrite}>
              Auto Write
            </button>
            <button type="button" onClick={this.handleToggleDark}>
              {this.state.dark ? "Light Theme" : "Dark Theme"}
            </button>
          </p>
          <Editor
            id="example"
            readOnly={this.state.readOnly}
            autoWrite={this.state.autoWrite}
            value={Serializer.deserialize(autoWriteTemplate)}
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
}

if (element) {
  ReactDOM.render(<Example />, element);
}
