import markdownit from "markdown-it";
import markPlugin from "./mark";
import checkboxPlugin from "./checkboxes";
import embedsPlugin from "./embeds";
import breakPlugin from "./breaks";
import tablesPlugin from "./tables";
import noticesPlugin from "./notices";
import underlinesPlugin from "./underlines";
import emojiPlugin from "markdown-it-emoji";
import { RulePlugin } from "../Extension";

export default function rules({
  embeds,
  rules = {},
  plugins = [],
}: {
  embeds: any;
  rules?: Record<string, any>;
  plugins?: RulePlugin[];
}) {
  const markdownIt = markdownit("default", {
    breaks: false,
    html: false,
    linkify: false,
    ...rules,
  })
    .use(embedsPlugin(embeds))
    .use(breakPlugin)
    .use(checkboxPlugin)
    .use(markPlugin({ delim: "==", mark: "highlight" }))
    .use(markPlugin({ delim: "!!", mark: "placeholder" }))
    .use(underlinesPlugin)
    .use(tablesPlugin)
    .use(noticesPlugin)
    .use(emojiPlugin);

  plugins.forEach(plugin => markdownIt.use(plugin));
  return markdownIt;
}
