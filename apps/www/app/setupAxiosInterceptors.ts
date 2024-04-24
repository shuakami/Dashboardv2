/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';
import {toast} from "@/registry/new-york/ui/use-toast";

export const setupAxiosInterceptors = (() => {
  // 使用静态属性来跟踪拦截器是否已经被设置
  let interceptorsSet = false;

  const whitelistedDomains = [
    '.51.la',
    '.openai-hk.com',
  ];

  return () => {
    if (interceptorsSet) {
      return;
    }

    axios.interceptors.request.use(config => {
      const jwt = Cookies.get('jwt');
      if (whitelistedDomains.some(domain => config.url!.match(domain))) {
        return config;
      }


      if (!jwt) {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined') {
          const delayAndRedirect = () => {
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000); // 延迟1.5秒执行重定向操作
          };
          toast({
            variant: "destructive",
            title: "身份验证失效",
            description: "请重新登录😿",
          });
          delayAndRedirect(); // 直接调用延迟跳转函数
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
      if (error.response) {
        // 检查返回的错误是否是账户被封的特定消息
        const errorMessage = error.response.data?.error?.message;
        if (errorMessage === "Your account has been blocked by an administrator") {
          // 检查是否在浏览器环境中
          if (typeof window !== 'undefined') {
            // 重定向到被封号的页面
            window.location.href = '/blocked';
            return Promise.reject(error); // 这里直接拒绝后续处理，以阻止其他逻辑执行
          }
        }
      }

      // 对于401错误的特殊处理，移动到这里来确保封号检查优先处理
      if (error.response && error.response.status === 401) {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined') {
          // 清除旧的JWT
          Cookies.remove('jwt');
          // 重定向到登录页
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      return Promise.reject(error);
    });

    interceptorsSet = true; // 标记拦截器已被设置
  };
})();
