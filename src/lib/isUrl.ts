export default function isUrl(text: string) {
  try {
    new URL(text);
    if (!text.includes("://")) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
