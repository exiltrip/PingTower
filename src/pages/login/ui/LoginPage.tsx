import React from 'react';
import { Card, Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = (values: any) => {
    console.log("Полученные данные:", values);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
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
            name="username"
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