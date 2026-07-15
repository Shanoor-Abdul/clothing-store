import { NextResponse } from "next/server";

export class ApiResponse {
  static success(
    data: unknown = null,
    message = "Success",
    status = 200
  ) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(
    message = "Something went wrong",
    status = 500,
    errors: unknown = null
  ) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      { status }
    );
  }
}