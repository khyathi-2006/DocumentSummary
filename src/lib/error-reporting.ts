export function reportRuntimeError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  console.error("Application runtime error:", {
    message,
    stack,
    ...context,
  });
}