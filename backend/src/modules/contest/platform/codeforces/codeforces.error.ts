export class CodeforcesProviderError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "CodeforcesProviderError";
  }
}
