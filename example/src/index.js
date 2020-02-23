import * as React from "react";
import { debounce } from "lodash";
import ReactDOM from "react-dom";
import Editor from "../../src";

const element = document.getElementById("main");
const savedText = localStorage.getItem("saved");
const exampleText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const defaultValue = savedText || exampleText;

// class GoogleEmbed extends React.Component<*> {
//   render() {
//     const { attributes, node } = this.props;
//     return <p {...attributes}>Google Embed ({node.data.get("href")})</p>;
//   }
// }

class Example extends React.Component {
  state = {
    readOnly: false,
    dark: localStorage.getItem("dark") === "enabled",
    value: undefined,
  };

  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };

  handleToggleDark = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    localStorage.setItem("dark", dark ? "enabled" : "disabled");
  };

  handleUpdateValue = () => {
    const existing = localStorage.getItem("saved") || "";
    const value = `${existing}\n\nedit!`;
    localStorage.setItem("saved", value);

    this.setState({ value });
  };

  handleChange = debounce(value => {
    localStorage.setItem("saved", value());
  }, 250);

  render() {
    const { body } = document;
    if (body) body.style.backgroundColor = this.state.dark ? "#181A1B" : "#FFF";

    return (
      <div>
        <div>
          <br />
          <button type="button" onClick={this.handleToggleReadOnly}>
            {this.state.readOnly ? "Editable" : "Read Only"}
          </button>
          <button type="button" onClick={this.handleToggleDark}>
            {this.state.dark ? "Light Theme" : "Dark Theme"}
          </button>
          <button type="button" onClick={this.handleUpdateValue}>
            Update value
          </button>
        </div>
        <br />
        <br />
        <Editor
          id="example"
          readOnly={this.state.readOnly}
          value={this.state.value}
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
              setTimeout(
                () => resolve("https://loremflickr.com/400/400"),
                1500
              );
            });
          }}
          getLinkComponent={href => {
            if (href.match(/google/)) {
              return GoogleEmbed;
            }
          }}
          dark={this.state.dark}
          autoFocus
        />
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<Example />, element);
}
