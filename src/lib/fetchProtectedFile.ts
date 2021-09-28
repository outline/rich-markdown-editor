export default async function fetchProtectedFile(src: string): Promise<Blob> {
  const authToken = localStorage.getItem("auth_token");

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${authToken}`);

  let response = await fetch(src, { headers });
  const {
    data: { presigned_url },
  } = await response.json();

  response = await fetch(presigned_url);
  const blob = await response.blob();

  return blob;
}
