import markdownit from "markdown-it";
import markPlugin from "markdown-it-mark";
import checkboxPlugin from "./checkboxes";
import embedsPlugin from "./embeds";
import breakPlugin from "./breaks";
import tablesPlugin from "./tables";

export default function rules({ embeds }) {
  return markdownit("default", {
    breaks: false,
    html: false,
  })
    .use(embedsPlugin(embeds))
    .use(breakPlugin)
    .use(checkboxPlugin)
    .use(markPlugin)
    .use(tablesPlugin);
}
