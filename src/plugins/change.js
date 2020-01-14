// @flow
import Plugin from "prosemirror-plugins";
import Extension from "../lib/Extension";

export default class ChangePlugin extends Extension {
  plugins: [
    new Plugin({
      view: () => {
        return {
          update: view => {
            this.options.onChange({
              view,
              selection: view.state.selection,
            })
          }
        }
      }
    })
  ]  
}
