import { api } from "@/shared/api/privateApi";

export const getStatusTimeline = async (params = {}) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await api.get(`/api/v1/reports/status-timeline`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
};