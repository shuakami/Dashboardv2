/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { useEffect } from 'react';

export const use51laAndRecaptcha = () => {
  useEffect(() => {
    let init51laScriptAdded = false; // 标记 51la 初始化脚本是否被添加到了<head>
    let initRecaptchaScriptAdded = false; // 标记 reCAPTCHA v3 初始化脚本是否被添加到了<head>
    let initMatomoScriptAdded = false; // 标记 Matomo 初始化脚本是否被添加到了<head>

    // 检查当前路径是否为/login
    const isLoginPath = window.location.pathname === '/login';

    // 加载 51la 脚本
    const existing51laScript = document.getElementById('LA_COLLECT');
    if (!existing51laScript) {
      const script51la = document.createElement('script');
      script51la.src = '//sdk.51.la/js-sdk-pro.min.js';
      script51la.id = 'LA_COLLECT';
      script51la.charset = 'UTF-8';
      script51la.async = true;

      const init51laScript = document.createElement('script');
      init51laScript.textContent = `LA.init({id:"${process.env.NEXT_PUBLIC_LA_ID}",ck:"${process.env.NEXT_PUBLIC_LA_ID}"});`;

      script51la.onload = () => {
        if (!init51laScriptAdded) {
          document.head.appendChild(init51laScript);
          init51laScriptAdded = true;
        }
      };

      document.head.appendChild(script51la);
    }

    // 仅在访问/login页面时，加载 reCAPTCHA v3 脚本
    if (isLoginPath && !document.getElementById('recaptcha_v3')) {
      const scriptRecaptcha = document.createElement('script');
      scriptRecaptcha.src = `https://www.recaptcha.net/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_KEY}`;
      scriptRecaptcha.id = 'recaptcha_v3';
      scriptRecaptcha.async = true;

      document.head.appendChild(scriptRecaptcha);

      scriptRecaptcha.onload = () => {
        initRecaptchaScriptAdded = true;
      };
    }

    // 加载 Matomo 脚本
    if (!document.getElementById('matomo_script')) {
      const scriptMatomo = document.createElement('script');
      scriptMatomo.id = 'matomo_script';
      scriptMatomo.async = true;
      const scriptText = `
        var _paq = window._paq = window._paq || [];
        _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
        _paq.push(["setCookieDomain", "*.analytics.sdjz.wiki"]);
        _paq.push(["setDomains", ["*.analytics.sdjz.wiki"]]);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="//${process.env.NEXT_PUBLIC_MATOMO_URL}/";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '1']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `;
      scriptMatomo.textContent = scriptText;
      document.head.appendChild(scriptMatomo);
      initMatomoScriptAdded = true;
    }

    // 清理函数
    return () => {
      if (init51laScriptAdded && document.head.contains(init51laScript)) {
        document.head.removeChild(init51laScript);
      }
      if (existing51laScript && document.head.contains(existing51laScript)) {
        document.head.removeChild(existing51laScript);
      }
      if (isLoginPath && document.getElementById('recaptcha_v3') && document.head.contains(document.getElementById('recaptcha_v3'))) {
        document.head.removeChild(document.getElementById('recaptcha_v3'));
      }
      if (initMatomoScriptAdded && document.getElementById('matomo_script')) {
        document.head.removeChild(document.getElementById('matomo_script'));
      }
    };
  }, []);
};
