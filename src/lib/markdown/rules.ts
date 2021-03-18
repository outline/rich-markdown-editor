import markdownit from "markdown-it";
import markPlugin from "./mark";
import checkboxPlugin from "./checkboxes";
import embedsPlugin from "./embeds";
import breakPlugin from "./breaks";
import tablesPlugin from "./tables";
import noticesPlugin from "./notices";
import underlinesPlugin from "./underlines";

export default function rules({ embeds }) {
  return markdownit("default", {
    breaks: false,
    html: false,
    linkify: true,
  })
    .use(embedsPlugin(embeds))
    .use(breakPlugin)
    .use(checkboxPlugin)
    .use(markPlugin({ delim: "==", mark: "highlight" }))
    .use(markPlugin({ delim: "!!", mark: "placeholder" }))
    .use(underlinesPlugin)
    .use(tablesPlugin)
    .use(noticesPlugin);
}
