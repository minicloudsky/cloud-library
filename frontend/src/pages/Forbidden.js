import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
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

export default Forbidden;