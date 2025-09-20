import {LoadingOutlined} from '@ant-design/icons';

const Loading = () => {
    return (
        <div className="!w-screen !h-screen flex justify-center items-center">
            <LoadingOutlined style={{ fontSize: '3rem' }} />
        </div>
    );
};

export default Loading;