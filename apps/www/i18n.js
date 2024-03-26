/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // 加载翻译文件
  .use(LanguageDetector) // 语言检测
  .use(initReactI18next) // 初始化react-i18next
  .init({
    fallbackLng: 'en', // 默认语言
    detection: {
      order: ['cookie', 'htmlTag', 'localStorage', 'path', 'subdomain'],
      caches: ['cookie'], // 缓存用户语言设置到cookie
      cookie: 'userLanguage', // 从'userLanguage' cookie读取语言设置
    },
    backend: {
      loadPath: '/public/locales/{{lng}}/SettingpageDescription.json', // 翻译文件路径
    },
  });

export default i18n;
