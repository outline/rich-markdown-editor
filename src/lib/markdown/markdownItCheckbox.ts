const CHECKBOX_REGEX = /\[(X|\s|_|-)\](\s(.*))?/i;

function matches(token) {
  return token.content.match(CHECKBOX_REGEX);
}

function isInline(token): boolean {
  return token.type === "inline";
}
function isParagraph(token): boolean {
  return token.type === "paragraph_open";
}

function looksLikeChecklist(tokens, index): boolean {
  return (
    isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    matches(tokens[index])
  );
}

function isChecklistItem(tokens, index): boolean {
  return tokens[index].type === "checkbox_item_open";
}

export default function markdownItCheckbox(md): void {
  let lastId = 0;

  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "checkbox-list", state => {
    const { Token } = state;
    const tokens = state.tokens;

    // work backwards through the tokens and find text that looks like a checkbox
    for (let i = tokens.length - 1; i > 0; i--) {
      const matches = looksLikeChecklist(tokens, i);
      if (matches) {
        const nodes = [];
        let token;

        const value = matches[1];
        const label = matches[3];
        const checked = value.toLowerCase() === "x";
        const existing = tokens[i];

        // is the previous token a checklist item too?
        // if not then we should start a new list.
        if (!looksLikeChecklist(tokens, i - 3)) {
          token = new Token("checkbox_list_open", "ul", 1);
          nodes.push(token);
        }

        token = new Token("checkbox_item_open", "li", 1);
        token.attrs = [["id", `checkbox-${lastId++}`]];
        if (checked === true) {
          token.attrs.push(["checked", "true"]);
        }
        nodes.push(token);

        token = new Token("paragraph_open", "p", 1);
        nodes.push(token);

        // get rid of the checkbox markdown syntax, replace with label
        existing.content = label;
        existing.children[0].content = label;
        nodes.push(existing);

        token = new Token("paragraph_close", "p", -1);
        nodes.push(token);

        token = new Token("checkbox_item_close", "li", -1);
        nodes.push(token);

        if (
          !tokens[i + 2] ||
          (!looksLikeChecklist(tokens, i + 2) &&
            !isChecklistItem(tokens, i + 2))
        ) {
          token = new Token("checkbox_list_close", "ul", -1);
          nodes.push(token);
        }

        tokens.splice(i - 1, 3, ...nodes);
      }
    }
  });
}
