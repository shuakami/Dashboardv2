/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';

export const setupAxiosInterceptors = (() => {
  // 使用静态属性来跟踪拦截器是否已经被设置
  let interceptorsSet = false;

  return () => {
    if (interceptorsSet) {
      return;
    }

    axios.interceptors.request.use(config => {
      const jwt = Cookies.get('jwt');

      if (!jwt) {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined') {
          // 如果没有JWT，则重定向到登录页
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No JWT found, redirecting to login'));
      }

      // 如果有JWT，则在每个请求头中添加Authorization
      config.headers.Authorization = `Bearer ${jwt}`;
      return config;
    }, error => {
      return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
      return response;
    }, error => {
      if (error.response && error.response.status === 401) {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined') {
          // 清除旧的JWT
          Cookies.remove('jwt');
          // 重定向到登录页
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    });

    interceptorsSet = true; // 标记拦截器已被设置
  };
})();
