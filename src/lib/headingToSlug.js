// @flow
import { escape } from "lodash";
import { Document, Block, Node } from "slate";
import slugify from "slugify";

// finds the index of this heading in the document compared to other headings
// with the same slugified text
function indexOfType(document, heading) {
  const slugified = escape(slugify(heading.text));
  const headings = document.nodes.filter((node: Block) => {
    if (!node.text) return false;
    return node.type.match(/^heading/) && slugified === escape(slugify(node.text));
  });

  return headings.indexOf(heading);
}

// calculates a unique slug for this heading based on it's text and position
// in the document that is as stable as possible
export default function headingToSlug(document: Document, node: Node) {
  const slugified = escape(slugify(node.text));
  const index = indexOfType(document, node);
  if (index === 0) return slugified;
  return `${slugified}-${index}`;
}
