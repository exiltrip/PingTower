import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  InputNumber, 
  Input,
  message,
  Space,
  Alert
} from 'antd';
import { 
  MutedOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { createQuickSilence } from '../api';

const { TextArea } = Input;

interface QuickSilenceButtonProps {
  checkId: number;
  checkName?: string;
  onSilenceCreated?: () => void;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'text';
}

const QuickSilenceButton: React.FC<QuickSilenceButtonProps> = ({
  checkId,
  checkName,
  onSilenceCreated,
  size = 'small',
  type = 'default'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleQuickSilence = async (values: any) => {
    setLoading(true);
    try {
      await createQuickSilence({
        checkId,
        duration: values.duration,
        reason: values.reason
      });
      
      message.success(`Чек "${checkName || checkId}" заглушен на ${values.duration} минут`);
      setModalVisible(false);
      form.resetFields();
      onSilenceCreated?.();
    } catch (error) {
      message.error('Ошибка создания быстрого сайленсинга');
      console.error('Error creating quick silence:', error);
    } finally {
      setLoading(false);
    }
  };

  const presetDurations = [
    { label: '15 мин', value: 15 },
    { label: '30 мин', value: 30 },
    { label: '1 час', value: 60 },
    { label: '2 часа', value: 120 },
    { label: '4 часа', value: 240 },
    { label: '8 часов', value: 480 },
    { label: '24 часа', value: 1440 }
  ];

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<MutedOutlined />}
        onClick={() => setModalVisible(true)}
        title={`Быстро заглушить чек ${checkName || checkId}`}
      >
        Заглушить
      </Button>

      <Modal
        title={
          <Space>
            <ClockCircleOutlined />
            Быстрое глушение чека
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Заглушить"
        cancelText="Отмена"
        confirmLoading={loading}
        width={500}
      >
        <div className="mb-4">
          <Alert
            message={`Чек: ${checkName || `ID ${checkId}`}`}
            type="info"
            showIcon
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleQuickSilence}
          initialValues={{
            duration: 60
          }}
        >
          <Form.Item
            name="duration"
            label="Продолжительность (в минутах)"
            rules={[
              { required: true, message: 'Укажите продолжительность' },
              { type: 'number', min: 1, max: 10080, message: 'От 1 минуты до 7 дней' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={10080}
              addonAfter="мин"
            />
          </Form.Item>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Быстрый выбор:</p>
            <Space wrap>
              {presetDurations.map((preset) => (
                <Button
                  key={preset.value}
                  size="small"
                  onClick={() => form.setFieldsValue({ duration: preset.value })}
                >
                  {preset.label}
                </Button>
              ))}
            </Space>
          </div>

          <Form.Item
            name="reason"
            label="Причина (необязательно)"
          >
            <TextArea
              rows={3}
              placeholder="Например: Плановые технические работы, ложные срабатывания и т.д."
            />
          </Form.Item>

          <Alert
            message="Информация"
            description={
              <div>
                <p>• Уведомления для этого чека будут отключены на указанное время</p>
                <p>• Автоматически создастся правило сайленсинга</p>
                <p>• Максимальная продолжительность: 7 дней</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </>
  );
};

export default QuickSilenceButton;
