var emojies_defs = require("markdown-it-emoji/lib/data/full.json");
var emojies_shortcuts = require('markdown-it-emoji/lib/data/shortcuts');
var normalize_opts = require('markdown-it-emoji/lib/normalize_opts');

function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
  var arrayReplaceAt = md.utils.arrayReplaceAt,
      ucm = md.utils.lib.ucmicro,
      ZPCc = new RegExp([ ucm.Z.source, ucm.P.source, ucm.Cc.source ].join('|'));

  function splitTextToken(text, level, Token) {
    var token, last_pos = 0, nodes = [];

    text.replace(replaceRE, function (match, offset, src) {
      var emoji_name;
      // Validate emoji name
      if (shortcuts.hasOwnProperty(match)) {
        // replace shortcut with full name
        emoji_name = shortcuts[match];

        // Don't allow letters before any shortcut (as in no ":/" in http://)
        if (offset > 0 && !ZPCc.test(src[offset - 1])) {
          return;
        }

        // Don't allow letters after any shortcut
        if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
          return;
        }
      } else {
        emoji_name = match.slice(1, -1);
      }

      // Add new tokens to pending list
      if (offset > last_pos) {
        token         = new Token('text', '', 0);
        token.content = text.slice(last_pos, offset);
        nodes.push(token);
      }

      token         = new Token('emoji', '', 0);
      token.markup  = emoji_name;
      token.content = emojies[emoji_name];
      nodes.push(token);

      last_pos = offset + match.length;
    });

    if (last_pos < text.length) {
      token         = new Token('text', '', 0);
      token.content = text.slice(last_pos);
      nodes.push(token);
    }

    return nodes;
  }

  return function emoji_replace(state) {
    var i, j, l, tokens, token,
        blockTokens = state.tokens,
        autolinkLevel = 0;

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') {
        continue;
      }
      tokens = blockTokens[j].children;
      console.log('children', tokens)

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];

        if (token.type === 'link_open' || token.type === 'link_close') {
          if (token.info === 'auto') { autolinkLevel -= token.nesting; }
        }

        console.log(token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content), token)

        if (token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content)) {
          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens, i, splitTextToken(token.content, token.level, state.Token)
          );
        }
      }
    }
  };
};

function bare(md, options) {
  var defaults = {
    defs: {},
    shortcuts: {},
    enabled: []
  };

  var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));


  md.renderer.rules.emoji = function(token, idx) {
    console.log(token)
    return '<span class="emoji emoji_' + token[idx].markup + '"></span>';
  };

  // md.core.ruler.after(
  //   "inline",
  //   "emoji",
  //   create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  // );
  // md.block.ruler.after(
  //   "table",
  //   "emoji",
  //   create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  // );
  // md.inline.ruler.after(
  //   "text",
  //   "emoji",
  //   create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  // );
  md.core.ruler.push(
    "emoji",
    create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  );
  // md.inline.ruler.after(
  //   "inline",
  //   "emoji",
  //   create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  // );
};


export default function emoji_plugin(md, options) {
  var defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };

  var opts = md.utils.assign({}, defaults, options || {});

  bare(md, opts);
};