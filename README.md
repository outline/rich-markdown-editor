# rich-markdown-editor

⚠️ Pre-release. This package is still under development – do not use. ⚠️

## Todo

- [x] Remove mobx
- [x] piping of plugins
- [x] Example in repo
- [ ] Themeprovider
- [ ] Allow passing schema
- [ ] Allow passing placeholders
- [ ] Hook for link search
- [ ] Hook for link click
- [ ] Image upload
- [ ] extraction of icons

## Development

```
import Editor from "rich-markdown-editor";

<Editor
  text="Title \n\nBody"
/>
```

See a working example in the `/example/` directory.

## Contributing

This project uses yarn to manage dependencies. You can use npm however it will not respect the yarn lock file and may install slightly different versions.

```
yarn install
```

When running in development webpack-serve is included to serve an example editor with hot reloading. After installing dependencies run `yarn start` to get going.

## License

TBD