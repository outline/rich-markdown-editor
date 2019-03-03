// @flow
import { escape } from "lodash";
import { Document, Block, Node } from "slate";
import slugify from "slugify";

// Slugify, escape, and remove periods from headings so that they are
// compatible with url hashes AND dom selectors
function safeSlugify(text) {
  return `h-${escape(slugify(text, { lower: true }).replace(".", "-"))}`;
}

// finds the index of this heading in the document compared to other headings
// with the same slugified text
function indexOfType(document, heading) {
  const slugified = safeSlugify(heading.text);
  const headings = document.nodes.filter((node: Block) => {
    if (!node.text) return false;
    return node.type.match(/^heading/) && slugified === safeSlugify(node.text);
  });

  return headings.indexOf(heading);
}

// calculates a unique slug for this heading based on it's text and position
// in the document that is as stable as possible
export default function headingToSlug(document: Document, node: Node) {
  const slugified = safeSlugify(node.text);
  const index = indexOfType(document, node);
  if (index === 0) return slugified;
  return `${slugified}-${index}`;
}
