/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */
"use client"
// SettingsContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [updateFlag, setUpdateFlag] = useState(false);

  const triggerUpdate = useCallback(() => {
    setUpdateFlag(prevFlag => !prevFlag); // 切换标志以触发更新
  }, []);

  return (
    <SettingsContext.Provider value={{ triggerUpdate, updateFlag }}>
      {children}
    </SettingsContext.Provider>
  );
};
