import isMarkdown from "./isMarkdown";

test("returns false for an empty string", () => {
  expect(isMarkdown("")).toBe(false);
});

test("returns false for plain text", () => {
  expect(isMarkdown("plain text")).toBe(false);
});

test("returns true for list", () => {
  expect(
    isMarkdown(`- item one
- item two
  - nested item`)
  ).toBe(true);
});

test("returns true for code fence", () => {
  expect(
    isMarkdown(`\`\`\`javascript
this is code
\`\`\``)
  ).toBe(true);
});

test("returns false for non-closed fence", () => {
  expect(
    isMarkdown(`\`\`\`
this is not code
`)
  ).toBe(false);
});

test("returns true for absolute link", () => {
  expect(isMarkdown(`[title](http://www.google.com)`)).toBe(true);
});

test("returns true for relative link", () => {
  expect(isMarkdown(`[title](/doc/mydoc-234tnes)`)).toBe(true);
});

test("returns true for relative image", () => {
  expect(isMarkdown(`![alt](/coolimage.png)`)).toBe(true);
});

test("returns true for absolute image", () => {
  expect(isMarkdown(`![alt](https://www.google.com/coolimage.png)`)).toBe(true);
});
