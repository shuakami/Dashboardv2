/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
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
