/** Business failure; the HTTP adapter preserves each endpoint's existing error body. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly shape: "message" | "error" | "string" = "message",
  ) {
    super(message);
    this.name = "AppError";
  }
}
