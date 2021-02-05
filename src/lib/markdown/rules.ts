import markdownit from "markdown-it";
import markdownitmark from "markdown-it-mark";
import markPlugin from "./mark";
import checkboxPlugin from "./checkboxes";
import embedsPlugin from "./embeds";
import breakPlugin from "./breaks";
import tablesPlugin from "./tables";
import noticesPlugin from "./notices";
import underlinesPlugin from "./underlines";

export default function rules({ embeds, enableTemplatePlaceholder }) {
  let mdIt = markdownit("default", {
    breaks: false,
    html: false,
  })
    .use(embedsPlugin(embeds))
    .use(breakPlugin)
    .use(checkboxPlugin);
  if (enableTemplatePlaceholder) {
    mdIt = mdIt.use(
      markPlugin({ delim: "{{", delimEnd: "}}", mark: "placeholder" })
    );
  }
  mdIt = mdIt
    .use(markPlugin({ delim: "==", mark: "mark" }))
    .use(underlinesPlugin)
    .use(tablesPlugin)
    .use(noticesPlugin);
  return mdIt;
}
