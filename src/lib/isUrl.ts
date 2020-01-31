export default function isUrl(text: string) {
  try {
    new URL(text);
    return true;
  } catch (err) {
    return false;
  }
}
