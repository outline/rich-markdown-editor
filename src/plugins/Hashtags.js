// @flow
import hashtagRegex from "hashtag-regex";
import InstantReplace from "slate-instant-replace";

const regex = hashtagRegex();

function Hashtags() {
  return InstantReplace((editor, lastWord: string) => {
    if (!lastWord) return;
    if (!editor.props.onClickHashtag) return;

    const match = lastWord.match(regex);

    // captures when "#" added before existing characters
    if (lastWord === "#") {
      const { startText } = editor.value;
      const text = startText.text;
      const match = regex.exec(text);

      if (match) {
        editor
          .unwrapInline({ type: "hashtag" })
          .moveStartTo(startText.key, match.index)
          .moveEndTo(startText.key, match.index + match[0].length)
          .wrapInline({ type: "hashtag" })
          .moveToStart()
          .moveForward(1);
      }

      // captures when characters added after a "#"
    } else if (match) {
      const diff = lastWord.length - match[0].length;

      editor
        .unwrapInline({ type: "hashtag" })
        .moveStartBackward(lastWord.length)
        .moveEndBackward(diff)
        .wrapInline({ type: "hashtag" })
        .moveForward(diff)
        .moveToEnd();
    } else {
      editor.unwrapInline({ type: "hashtag" });
    }
  });
}

export default Hashtags;
