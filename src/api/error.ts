// src/utils/error.ts 
export type ApiError = {
  message: string;
  status?: number;
};

export const normalizeError = (error: any): ApiError => {
  return {
    message: error?.response?.data?.message || "Something went wrong",
    status: error?.response?.status,
  };
};
