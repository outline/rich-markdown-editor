// Adapted from:
// https://github.com/markdown-it/markdown-it-mark/blob/master/index.js

export default function placeholderPlugin(md) {
  function tokenize(state, silent) {
    let i, token;

    const start = state.pos,
      marker = state.src.charCodeAt(start);

    if (silent) {
      return false;
    }

    if (marker !== 33) {
      return false;
    }

    const scanned = state.scanDelims(state.pos, true);
    const ch = String.fromCharCode(marker);
    let len = scanned.length;

    if (len < 2) {
      return false;
    }

    if (len % 2) {
      token = state.push("text", "", 0);
      token.content = ch;
      len--;
    }

    for (i = 0; i < len; i += 2) {
      token = state.push("text", "", 0);
      token.content = ch + ch;

      if (!scanned.can_open && !scanned.can_close) {
        continue;
      }

      state.delimiters.push({
        marker,
        length: 0, // disable "rule of 3" length checks meant for emphasis
        jump: i,
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close,
      });
    }

    state.pos += scanned.length;
    return true;
  }

  // Walk through delimiter list and replace text tokens with tags
  //
  function postProcess(state, delimiters) {
    let i, j, startDelim, endDelim, token;
    const loneMarkers: number[] = [],
      max = delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 33) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token = state.tokens[startDelim.token];
      token.type = "placeholder_open";
      token.tag = "span";
      token.nesting = 1;
      token.markup = "!!";
      token.content = "";

      token = state.tokens[endDelim.token];
      token.type = "placeholder_close";
      token.tag = "span";
      token.nesting = -1;
      token.markup = "!!";
      token.content = "";

      if (
        state.tokens[endDelim.token - 1].type === "text" &&
        state.tokens[endDelim.token - 1].content === "!"
      ) {
        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === "mark_close") {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  md.inline.ruler.before("emphasis", "placeholder", tokenize);
  md.inline.ruler2.before("emphasis", "placeholder", function(state) {
    let curr;
    const tokensMeta = state.tokens_meta,
      max = (state.tokens_meta || []).length;

    postProcess(state, state.delimiters);

    for (curr = 0; curr < max; curr++) {
      if (tokensMeta[curr] && tokensMeta[curr].delimiters) {
        postProcess(state, tokensMeta[curr].delimiters);
      }
    }
  });
}
