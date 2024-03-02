/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { useEffect } from 'react';

export const use51laAnalytics = () => {
  useEffect(() => {
    let initScriptAdded = false; // 新增一个标记，标记初始化脚本是否被添加到了<head>

    const existingScript = document.getElementById('LA_COLLECT');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//sdk.51.la/js-sdk-pro.min.js';
      script.id = 'LA_COLLECT';
      script.charset = 'UTF-8';
      script.async = true;

      const initScript = document.createElement('script');
      initScript.textContent = `LA.init({id:"3HelNpBlGrfK32c6",ck:"3HelNpBlGrfK32c6"});`;

      script.onload = () => {
        document.head.appendChild(initScript);
        initScriptAdded = true; // 当初始化脚本被添加时，更新标记状态
      };

      document.head.appendChild(script);

      // 清理函数中加入检查
      return () => {
        document.head.removeChild(script);
        if (initScriptAdded && document.head.contains(initScript)) { // 仅当初始化脚本被添加并且当前仍在<head>中时，尝试移除
          document.head.removeChild(initScript);
        }
      };
    }
  }, []);
};
