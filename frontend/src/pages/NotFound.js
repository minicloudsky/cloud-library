import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <div className="error-actions">
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
            <Button onClick={() => navigate(-1)}>
              返回上页
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFound;