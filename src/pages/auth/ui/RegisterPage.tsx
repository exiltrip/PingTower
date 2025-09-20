import React from 'react';
import { Card, Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import type { RegisterData, RegisterResponse } from '../models/authData';
import { useNotifier } from '../../../hooks/useSnackbar';


const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const { notify } = useNotifier();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterData) => {
    try {
      const response: RegisterResponse = await registerUser(values);

      notify(response.message, true);

      if (response.accessToken) {
        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken ?? "");
      }

      navigate("/"); 
    } catch (err: any) {
      const errorData = err.response?.data || err;
      if (Array.isArray(errorData?.error)) {
        errorData.error.forEach((msg: string) => notify(msg, false));
      } else {
        notify(errorData?.message || 'Произошла ошибка', false);
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <Title level={3}>Регистрация</Title>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          {/* Пароль */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          {/* Имя */}
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Имя"
              size="large"
            />
          </Form.Item>

          {/* Фамилия */}
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Фамилия"
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
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={() => navigate("/login")}
          >
            Уже есть аккаунт? Войти
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
