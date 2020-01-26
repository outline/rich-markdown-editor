import { escape } from "lodash";
import slugify from "slugify";

// Slugify, escape, and remove periods from headings so that they are
// compatible with url hashes AND dom selectors
function safeSlugify(text: string) {
  return `h-${escape(slugify(text, { lower: true }).replace(".", "-"))}`;
}

// calculates a unique slug for this heading based on it's text and position
// in the document that is as stable as possible
export default function headingToSlug(text: string) {
  return safeSlugify(text);
  // const index = indexOfType(document, node);
  // if (index === 0) return slugified;
  // return `${slugified}-${index}`;
}
