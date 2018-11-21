// @flow
import * as React from "react";
import { map } from "lodash";
import styled from "styled-components";
import type { SlateNodeProps } from "../types";
import CopyButton from "./CopyButton";

function getCopyText(node) {
  return node.nodes.reduce((memo, line) => `${memo}${line.text}\n`, "");
}

const languages = {
  css: "CSS",
  clike: "C",
  csharp: "C#",
  java: "Java",
  javascript: "JavaScript",
  markup: "Markup",
  php: "PHP",
  python: "Python",
  ruby: "Ruby",
  typescript: "TypeScript",
};

export default function Code({
  children,
  node,
  readOnly,
  attributes,
  editor,
}: SlateNodeProps) {
  const { data } = node;
  const language = data.get("language") || "javascript";

  const onSelectLanguage = ev => {
    editor.change(change =>
      change.setNodeByKey(node.key, {
        data: { ...data, language: ev.target.value },
      })
    );
  };

  return (
    <Container {...attributes} spellCheck={false}>
      {readOnly && <CopyButton text={getCopyText(node)} />}
      <code>{children}</code>
      {!readOnly && (
        <Language onChange={onSelectLanguage} contentEditable={false}>
          {map(languages, (name, value) => (
            <option key={value} value={value} selected={language === value}>
              {name}
            </option>
          ))}
        </Language>
      )}
    </Container>
  );
}

const Language = styled.select`
  position: absolute;
  bottom: 2px;
  right: 2px;
  opacity: 0;
`;

const Container = styled.div`
  position: relative;
  background: ${props => props.theme.codeBackground};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.codeBorder};

  code {
    display: block;
    overflow-x: scroll;
    padding: 0.5em 1em;
    line-height: 1.4em;
  }

  pre {
    margin: 0;
  }

  &:hover {
    > span {
      opacity: 1;
    }

    ${Language} {
      opacity: 1;
    }
  }
`;
