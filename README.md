[![npm version](https://badge.fury.io/js/rich-markdown-editor.svg)](https://badge.fury.io/js/rich-markdown-editor) [![CircleCI](https://circleci.com/gh/outline/rich-markdown-editor.svg?style=svg)](https://circleci.com/gh/outline/rich-markdown-editor)

# rich-markdown-editor

⚠️ Pre-release. This package is still under active development – do not use. ⚠️

## Usage

```javascript
import Editor from "rich-markdown-editor";

<Editor
  defaultValue="Title\n\nBody"
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

#### `uploadImage`

If you want the editor to support images then this callback must be provided. The callback should accept a single `File` object and return a promise the resolves to a url when the image has been uploaded to a storage location, for example S3. eg:

```javascript
<Editor
  uploadImage={async File => {
    const result = await s3.upload(File);
    return result.url;
  }}
/>
```

#### `onSave`

This callback is triggered when the user explicitly requests to save using a keyboard shortcut, `META+S` or `META+Enter`. You can use it as a signal to save the document to a remote server.

#### `onCancel`

This callback is triggered when the escape key is hit within the editor. You may use it to cancel editing.

#### `onChange`

This callback is triggered when the contents of the editor changes, usually due to user input such as a keystroke or using formatting options. You may use this to locally persist the editors state, see the [inbuilt example](/blob/master/example/index.js).

#### `onImageUploadStart`

This callback is triggered before `uploadImage` and can be used to show some UI that indicates an upload is in progress.

#### `onImageUploadStop`

Triggered once an image upload has succeeded or failed.

#### `onSearchLink`

The editor provides an ability to search for links to insert from the formatting toolbar. If this callback is provided it should accept a search term as the only parameter and return a promise that resolves to an array of [SearchResult](/blob/master/src/types.js) objects. eg:


```javascript
<Editor
  onSearchLink={async searchTerm => {
    const results = await MyAPI.search(searchTerm);

    return results.map(result => {
      title: result.name,
      url: result.url
    })
  }}
/>
```

#### `onClickLink`

This callback allows overriding of link handling. It's often the case that you want to have external links open a new window whilst internal links may use something like `react-router` to navigate. If no callback is provided then default behavior will apply to all links. eg:


```javascript
import { history } from "react-router";

<Editor
  onClickLink={href => {
    if (isInternalLink(href)) {
      history.push(href);
    } else {
      window.location.href = href;
    }
  }}
/>
```

## Contributing

This project uses yarn to manage dependencies. You can use npm however it will not respect the yarn lock file and may install slightly different versions.

```
yarn install
```

When running in development webpack-serve is included to serve an example editor with hot reloading. After installing dependencies run `yarn start` to get going.

## License

This project is [BSD licensed](/blob/master/LICENSE).