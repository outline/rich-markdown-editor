export default function isUrl(text: string) {
  if (text.match(/\n/)) {
    return false;
  }

  try {
    new URL(text);
    return true;
  } catch (err) {
    return false;
  }
}
