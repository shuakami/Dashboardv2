/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import React from 'react';
import {message, Modal} from 'antd';
import { keys } from '@/app/config/key';
import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';
import FingerprintJS, { load } from '@fingerprintjs/fingerprintjs';

// 缓存动态验证码相关信息
const dynamicCodes = new Map();

// 持久化存储
const LOCAL_STORAGE_LOCK_KEY = 'tokenAttemptLocks';
declare const grecaptcha: any;

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 2 * 60 * 1000; // 2分钟锁定
const BRUTE_FORCE_ATTEMPT_THRESHOLD = 15; // 爆破尝试阈值
const BRUTE_FORCE_LOCK_DURATION = 114.514; // 特殊爆破防护锁定时间
const REQUEST_THRESHOLD = 5; // 请求阈值
const MONITOR_WINDOW = 60 * 1000; // 1分钟监控窗口
const BRUTE_FORCE_MONITOR_WINDOW = 5 * 60 * 1000; // 5分钟爆破监控窗口

const getGlobalLockInfo = () => {
  const lockInfo = Cookies.get(LOCAL_STORAGE_LOCK_KEY);
  return lockInfo ? JSON.parse(lockInfo).global : undefined;
};

const setGlobalLockInfo = (info: any) => {
  const existingLocks = Cookies.get(LOCAL_STORAGE_LOCK_KEY) ? JSON.parse(Cookies.get(LOCAL_STORAGE_LOCK_KEY)) : {};
  existingLocks.global = info;
  Cookies.set(LOCAL_STORAGE_LOCK_KEY, JSON.stringify(existingLocks), { expires: 7 });
};


const checkAndSetBruteForceLock = () => {
  const now = Date.now();
  let globalLock = getGlobalLockInfo();

  if (!globalLock) {
    globalLock = {};
  }

  if (!globalLock.bruteForceAttempts) {
    globalLock.bruteForceAttempts = { count: 1, startTime: now };
  } else {
    if (now - globalLock.bruteForceAttempts.startTime > BRUTE_FORCE_MONITOR_WINDOW) {
      globalLock.bruteForceAttempts = { count: 1, startTime: now };
    } else {
      globalLock.bruteForceAttempts.count++;
    }
  }

  if (globalLock.bruteForceAttempts.count >= BRUTE_FORCE_ATTEMPT_THRESHOLD) {
    globalLock.lockUntil = now + BRUTE_FORCE_LOCK_DURATION;
    globalLock.bruteForceLocked = true;
  }

  setGlobalLockInfo(globalLock);
};



export const authenticateToken = async (token: string) => {
  const now = Date.now();
  // @ts-ignore
  const starkey = keys[token];

  // 检查是否存在全局锁定
  let globalLock = getGlobalLockInfo();
  console.log(`[authenticateToken] Global lock info:`, globalLock);
  if (globalLock && globalLock.lockUntil && now < globalLock.lockUntil) {
    const lockTimeLeft = Math.round((globalLock.lockUntil - now) / 1000);
    console.log(`[authenticateToken] Tokens are globally locked, ${lockTimeLeft} seconds left until unlock.`);
    const lockMessage = globalLock.bruteForceLocked
      ? (
        <>
          <div>还试？给你一棍子打死</div>
          <div>所有令牌因尝试次数过多而被全局锁定，请在<strong>{lockTimeLeft}</strong>秒后再试</div>
        </>
      )
      : `所有令牌因尝试次数过多而被全局锁定，请在${lockTimeLeft}秒后再试。`;

    Modal.error({
      title: '你——无权申辩了',
      content: lockMessage,
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true
    });
    return { valid: false, message: lockMessage };
  }

  // 在此处调用特殊爆破防护检查
  checkAndSetBruteForceLock();

  if (token.length <= 3 || token.length >= 200) {
    Modal.error({
      title: '错误',
      content: '令牌长度无效，应大于3且小于200。',
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true
    });
    setTimeout(() => Modal.destroyAll(), 3000);
    return { valid: false, message: '令牌长度无效，应大于3且小于200。' };
  }


  let record = dynamicCodes.get(token);
  if (!record) {
    record = { code: '', expiry: 0, attempts: MAX_ATTEMPTS, lastAttemptTime: now, requestCount: 1 };
    dynamicCodes.set(token, record);
  } else {
    if (record.lockUntil && now < record.lockUntil) {
      const remainingLockTime = Math.round((record.lockUntil - now) / 1000);
      Modal.error({
        title: '验证失败',
        content: `尝试次数过多，${remainingLockTime}秒后重试。`,
        okButtonProps: { style: { display: 'none' } },
        autoFocusButton: null,
        keyboard: true,
        maskClosable: true
      });
      return { valid: false, message: `尝试次数过多，${remainingLockTime}秒后重试。` };
    }
    if (now - record.lastAttemptTime < MONITOR_WINDOW) {
      record.requestCount++;
      if (record.requestCount > REQUEST_THRESHOLD) {
        record.lockUntil = now + LOCK_DURATION;
        const remainingLockTime = Math.round(LOCK_DURATION / 1000);
        Modal.error({
          title: '验证失败',
          content: `请求过于频繁，${remainingLockTime}秒后重试。`,
          okButtonProps: { style: { display: 'none' } },
          autoFocusButton: null,
          keyboard: true,
          maskClosable: true
        });
        return { valid: false, message: `请求过于频繁，${remainingLockTime}秒后重试。` };
      }
    } else {
      record.requestCount = 1;
      record.lastAttemptTime = now;
      record.lockUntil = undefined;
    }
  }

  record.expiry = now + (5 * 60 * 1000);
  record.attempts = MAX_ATTEMPTS;
  dynamicCodes.set(token, record);

  return { valid: true, starkey };
};

export const verifyDynamicCode = async (token: string, password: string) => {
  const now = Date.now();
  // 获取全局锁定信息
  const globalLock = getGlobalLockInfo();
  console.log(`[verifyDynamicCode] Global lock info:`, globalLock);

  // 检查是否存在全局锁定
  if (globalLock && globalLock.lockUntil && now < globalLock.lockUntil) {
    Modal.error({
      title: '验证失败',
      content: '所有令牌因尝试次数过多而被全局锁定，请稍后再试。',
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true
    });
    return false; // 直接返回失败，不进行后续验证
  }

  // 在尝试进行登录前，调用特殊爆破防护检查和设置全局锁定逻辑
  checkAndSetBruteForceLock();

  // 再次获取全局锁定信息，以确保没有在上一步中被设置锁定
  const updatedGlobalLock = getGlobalLockInfo();
  if (updatedGlobalLock && updatedGlobalLock.lockUntil && now < updatedGlobalLock.lockUntil) {
    Modal.error({
      title: '验证失败',
      content: '由于尝试次数过多，所有令牌已被全局锁定，请稍后再试。',
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true
    });
    return false; // 直接返回失败，不进行后续验证
  }

  try {
    // 动态加载 reCAPTCHA 脚本并获取 token
    const recaptchaToken = await new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute('6LcpUW4pAAAAAGMEM0quB2kUhtRpX5HWj9PolOcT', { action: 'login' }).then(resolve).catch(reject);
      });
    });

    // 将 token 发送到后端进行验证
    const verificationResponse = await axios.post('/api/verifyRecaptcha', {
      token: recaptchaToken,
    });

    // 检查后端验证结果
    if (!verificationResponse.data.success) {
      console.error('reCAPTCHA verification failed:', verificationResponse.data.message);
      Modal.error({
        title: '验证失败',
        content: 'reCAPTCHA 验证未通过，请稍后再试。',
        okButtonProps: { style: { display: 'none' } },
        autoFocusButton: null,
        keyboard: true,
        maskClosable: true,
      });
      return false;
    }
  } catch (error) {
    console.error('Error during reCAPTCHA verification:', error);
    Modal.error({
      title: '验证错误',
      content: '无法完成 reCAPTCHA 验证，请检查网络连接并稍后再试。',
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true,
    });
    return false;
  }



  try {
    // 尝试进行登录
    const authRes = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
      identifier: token,
      password,
    });

    const jwt = authRes.data.jwt;

    // 检查响应状态是否为200
    if (authRes.status === 200) {
      console.log(`[verifyDynamicCode] Login successful for token ${token}.`);
      const fp = await load();
      const result = await fp.get();
      const fingerprint = result.visitorId; // 这是浏览器的唯一指纹

      try {
        // 发送IP验证请求，携带用户名(token)和浏览器指纹
        const ipVerificationResponse = await axios.post('/api/verifyIp', {
          username: token, // 用户名直接使用token
          fingerprint: fingerprint
        }, {
          headers: {
            'Authorization': `Bearer ${jwt}` // 将JWT包含在请求头中
          }
        });


        if (ipVerificationResponse.status === 200) {
          message.success('您的登录信息已通过因素验证，ByteFreeze守护您的账户安全。');
          Cookies.set('jwt', jwt);
          return true;
        } else {
          message.error('验证未通过，请确保你是在授权的设备上操作。');
          // 返回一个包含特定标识的对象
          return { success: false, error: 'Verification required', jwt: jwt };
        }
      } catch (error) {
        message.warning('验证吧，登录信息有点小问题。');
        // 返回一个包含特定标识的对象
        return { success: false, error: 'Verification required', jwt: jwt };
      }

    }
  } catch (error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
    // 检查是否是封号的特定错误消息
    const errorMessage = axiosError.response?.data?.error?.message;
    if (errorMessage === "Your account has been blocked by an administrator") {
      // 如果是封号错误，重定向到封号页面
      if (typeof window !== 'undefined') {
        Cookies.set('blockedIdentifier', token, { expires: 1/2880, path: '/' }); // 确保对全站有效
        window.location.href = '/blocked';
      }
      return false; // 返回false，不执行后面的错误处理逻辑
    }

    // 处理其他类型的登录失败情况
    console.log(`[verifyDynamicCode] Login failed for token ${token}. Error: ${error}`);
    Modal.error({
      title: '验证失败',
      content: '令牌或验证码错误',
      okButtonProps: { style: { display: 'none' } },
      autoFocusButton: null,
      keyboard: true,
      maskClosable: true
    });
    return false;
  }
};
