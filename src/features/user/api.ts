// src/features/user/api.ts 
import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

export const getProfile = async () => {
  const res = await apiClient.get(API_ENDPOINTS.USER.GET_PROFILE);
  return res.data;
};

export const updateProfile = async (payload: any) => {
  const res = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, payload);
  return res.data;
};