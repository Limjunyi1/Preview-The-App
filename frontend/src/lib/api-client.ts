const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Json = Record<string, unknown>;

type ApiFetchOptions = RequestInit & {
  parseJson?: boolean;
};

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

export async function apiFetch<TResponse = Json>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { parseJson = true, headers, ...rest } = options;

  const isFormData = rest.body instanceof FormData;
  const requestHeaders = isFormData ? headers : { ...defaultHeaders, ...headers };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: requestHeaders,
    ...rest,
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message);
  }

  if (!parseJson) return undefined as TResponse;
  return (await response.json()) as TResponse;
}

async function safeParseError(response: Response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload === "object" && "message" in payload) {
      return String((payload as { message?: string }).message ?? response.statusText);
    }
    return response.statusText;
  } catch {
    return response.statusText;
  }
}

