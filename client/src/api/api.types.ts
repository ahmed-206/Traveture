

/** Success response that carries a payload. */
export interface ApiSuccessResponse<T> {
  status: 'success';
  message?: string;
  results?: number;
  data: T;
}

/** Success response with no payload (delete, logout, token refresh). */
export interface ApiMessageResponse {
  status: 'success';
  message: string;
}

/** Error response (4xx / 5xx). */
export interface ApiErrorResponse {
  status: 'fail' | 'error';
  message: string;
}
