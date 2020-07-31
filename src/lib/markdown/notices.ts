import customFence from "markdown-it-container";

export default function notice(md): void {
  return customFence(md, "notice", {
    marker: ":",
    validate: () => true,
  });
}
