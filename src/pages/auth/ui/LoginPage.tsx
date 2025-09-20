import React from 'react';
import { Card, Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useNotifier } from '../../../hooks/useSnackbar';
import { loginUser } from '../api/auth';
import type { LoginData, LoginResponse } from '../models/authData';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { notify } = useNotifier();
  const navigate = useNavigate();
  const onFinish = async (values: LoginData) => {
    try {
      const response: LoginResponse = await loginUser(values);

      notify(response.message, true);

      if (response.accessToken) {
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken ?? "");
      }

      navigate("/");
    } catch (err: any) {
      const errorData = err.response?.data || err;

      if (Array.isArray(errorData?.message)) {
        errorData.message.forEach((msg: string) => notify(msg, false));
      } else if (typeof errorData?.message === "string") {
        notify(errorData.message, false);
      } else {
        notify('Произошла ошибка', false);
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center ">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <Title level={3}>PingTower</Title>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
                { required: true, message: "Укажите email" },
                { type: "email", message: "Введите корректный email" }
            ]}
            >
            <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="rounded-xl"
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={() => navigate("/register")}
          >
            Зарегистрироваться
          </Button>
        </div>

      </Card>
    </div>
  );
};

export default LoginPage;