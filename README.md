[![CircleCI](https://circleci.com/gh/outline/rich-markdown-editor.svg?style=svg)](https://circleci.com/gh/outline/rich-markdown-editor)

# rich-markdown-editor

⚠️ Pre-release. This package is still under development – do not use. ⚠️

## Usage

```javascript
import Editor from "rich-markdown-editor";

<Editor
  defaultValue="Title \n\nBody"
/>
```

See a working example in the [example directory](/blob/master/example).


### Props

#### `defaultValue`

A markdown string that represents the initial value of the editor. Use this to prop to restore
previously saved content for the user to continue editing.

#### `titlePlaceholder`

Allows overriding of the placeholder text displayed where a title would be. The default is "Your title".

#### `bodyPlaceholder`

Allows overriding of the placeholder text displayed in the main body content. The default is "Write something nice…".

#### `emoji`

An optional emoji character that will be prepended to the title. This allows the main title text to 
remain aligned with the body content.

#### `readOnly`

With `readOnly` set to `false` the editor is optimized for composition. When `true` the editor can be used to display previously written content – headings gain anchors, a table of contents displays and links become clickable.

#### `plugins`

Allows additional Slate plugins to be passed to the underlying Slate editor.

#### `schema`

Allows additional Slate schema to be passed to the underlying Slate editor.

#### `theme`

Allows overriding the inbuilt theme to brand the editor, for example use your own font face and brand colors to have the editor fit within your application. See the [inbuilt theme](/blob/master/src/theme.js) for an example of the keys that should be provided.

### Callbacks

## Contributing

This project uses yarn to manage dependencies. You can use npm however it will not respect the yarn lock file and may install slightly different versions.

```
yarn install
```

When running in development webpack-serve is included to serve an example editor with hot reloading. After installing dependencies run `yarn start` to get going.

## License

This project is [BSD licensed](/blob/master/LICENSE).