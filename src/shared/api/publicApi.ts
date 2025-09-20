import { axiosInstance } from "./axiosInstance";

export const publicApi = {
    get: axiosInstance.get,
    post: axiosInstance.post,
    put: axiosInstance.put,
    delete: axiosInstance.delete,
};