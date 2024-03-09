/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React from 'react';
import { Modal, notification } from 'antd';
import { keys } from '@/app/config/key';
import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';

// 缓存动态验证码相关信息
const dynamicCodes = new Map();

// 持久化存储
const LOCAL_STORAGE_LOCK_KEY = 'tokenAttemptLocks';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 2 * 60 * 1000; // 2分钟锁定
const BRUTE_FORCE_ATTEMPT_THRESHOLD = 15; // 爆破尝试阈值
const BRUTE_FORCE_LOCK_DURATION = 1314520666; // 特殊爆破防护锁定时间
const REQUEST_THRESHOLD = 5; // 请求阈值
const MONITOR_WINDOW = 60 * 1000; // 1分钟监控窗口
const BRUTE_FORCE_MONITOR_WINDOW = 5 * 60 * 1000; // 5分钟爆破监控窗口

function simpleHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

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
    // 尝试进行登录
    const authRes = await axios.post('https://xn--7ovw36h.love/api/auth/local', {
      identifier: token,
      password,
    });

    // 检查响应状态是否为200
    if (authRes.status === 200) {
      console.log(`[verifyDynamicCode] Login successful for token ${token}.`);
      const jwt = authRes.data.jwt;
      Cookies.set('jwt', jwt);
      return true;
    }
  } catch (error) {
    // 处理登录失败的情况
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
