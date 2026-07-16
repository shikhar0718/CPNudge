import type { Response } from "express";
class APIResponse {
  static ok(res: Response, message: string, data: unknown = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, message: string, data: unknown = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static paginated(
    res: Response,
    message: string,
    data: unknown,
    pagination: { page: number; limit: number; total: number; totalPages: number }
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

export default APIResponse;
