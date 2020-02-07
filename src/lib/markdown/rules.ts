import markdownit from "markdown-it";
import markPlugin from "markdown-it-mark";
import checkboxPlugin from "./markdownItCheckbox";
import breakPlugin from "./markdownBreakToParagraph";

export default markdownit("default", {
  breaks: false,
  html: false,
})
  .use(breakPlugin)
  .use(checkboxPlugin)
  .use(markPlugin);
