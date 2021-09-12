import MarkdownIt from "markdown-it";

const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Parse queryblock the same way as fence to avoid parsing inner content
 * Reference https://github.com/markdown-it/markdown-it/blob/master/lib/rules_block/fence.js
 * @param md
 */
export default function queryblock(md: MarkdownIt): void {
  function container(state, startLine, endLine, silent) {

    // if we're in an indented block (e.g., list), it's not a queryblock
    if (state.blkIndent > 0) {
      return false;
    }

    // if the starting line is indented, it's not a queryblock
    if (state.tShift[startLine] > 0) {
      return false;
    }

    let len,
      nextLine,
      mem,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

    if (pos + 3 > max) {
      return false;
    }

    const marker = state.src.charCodeAt(pos);

    if (marker !== 0x3b /* ; */) {
      return false;
    }

    // scan marker length
    mem = pos;
    pos = state.skipChars(pos, marker);

    len = pos - mem;

    if (len < 3) {
      return false;
    }

    const markup = state.src.slice(mem, pos);
    const params = state.src.slice(pos, max);

    if (marker === 0x3b /* ; */) {
      if (params.indexOf(String.fromCharCode(marker)) >= 0) {
        return false;
      }
    }

    // match for valid uuid
    if (params.length !== 36) {
      return false;
    }
    if (!params.match(uuidRegexp)) {
      return false;
    }

    // Since start is found, we can report success here in validation mode
    if (silent) {
      return true;
    }

    // search end of block
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (state.src.charCodeAt(pos) !== marker) {
        continue;
      }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      pos = state.skipChars(pos, marker);

      // closing code fence must be at least as long as the opening one
      if (pos - mem < len) {
        continue;
      }

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) {
        continue;
      }

      haveEndMarker = true;
      // found!
      break;
    }

    // If a fence has heading spaces, they should be removed from its inner block
    len = state.sCount[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    const token = state.push("container_query_block", "code", 0);
    token.info = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = markup;
    token.map = [startLine, state.line];

    return true;
  }

  md.block.ruler.before("fence", "container_query_block", container, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
}
