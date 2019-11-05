// @flow
import hashtagRegex from "hashtag-regex";
import InstantReplace from "slate-instant-replace";

const regex = hashtagRegex();

function Hashtags() {
  return InstantReplace((editor, lastWord) => {
    if (lastWord) {
      const match = lastWord.match(regex);

      if (match) {
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
    }
  });
}

export default Hashtags;
