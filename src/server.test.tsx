import * as React from "react";
import ReactDOMServer from "react-dom/server";
import Editor from ".";

test("renders without DOM", () => {
  const output = ReactDOMServer.renderToString(<Editor value="Test SSR" />);
  expect(output).toBe(true);
  expect(output.includes("Test SSR")).toBe(true);
});
