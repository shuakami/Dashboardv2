/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
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
