// A thin wrapper around fetch for talking to our own API routes.
// Automatically sends cookies and parses JSON, throwing a readable
// error message on failure so pages can catch() it and show it.

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // send the auth cookie with every request
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}