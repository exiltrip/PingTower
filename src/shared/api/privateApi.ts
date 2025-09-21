import { axiosInstance } from "./axiosInstance";

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 и мы уже не пытаемся обновить токен
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Если токен уже обновляется, ставим запрос в очередь
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const response = await axiosInstance.post("/auth/refresh", {},
                {headers: {
                    "Authorisation": refreshToken
                }});

                    // const { access_token, refresh_token } = response.data;

                    // localStorage.setItem("access_token", access_token);
                    // localStorage.setItem("refresh_token", refresh_token);

                    const accessToken = localStorage.getItem("access_token");
                    // Устанавливаем новый токен для исходного запроса
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Выполняем все отложенные запросы
                    processQueue(null, accessToken);

                    // Повторяем исходный запрос
                    return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Если refresh не удался, очищаем токены и перенаправляем на логин
                if (refreshError.response.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    processQueue(refreshError, null);
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    get: axiosInstance.get,
    post: axiosInstance.post,
    put: axiosInstance.put,
    delete: axiosInstance.delete,
};