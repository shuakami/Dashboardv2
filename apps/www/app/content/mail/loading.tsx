/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import React from 'react';
import { motion } from 'framer-motion';
import './ScanLightLogo.css'; // 引入CSS文件

const ScanLightLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo-container">
        <div className="logo">ByteFreeze</div>
      </div>
    </motion.div>
  );
};

export default ScanLightLogo;
