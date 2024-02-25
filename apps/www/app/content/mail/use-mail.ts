/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { atom, useAtom } from 'jotai';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { fetchMails, Mail } from '@/app/content/mail/data';
// @ts-ignore
import isEqual from 'lodash/isEqual';
// @ts-ignore
import debounce from 'lodash/debounce';

type Config = {
  selected: string | null;
};

const configAtom = atom<Config>({
  selected: null,
});

const mailsCache = atom<{ data: Mail[]; timestamp: number } | null>(null);

export function useMail() {
  const [config, setConfig] = useAtom(configAtom);
  const [mails, setMails] = useState<Mail[]>([]);
  const [cachedMails, setCachedMails] = useAtom(mailsCache);

  const debouncedRefreshMailsRef = useRef(debounce(async () => {
    const fetchedMails = await fetchMails();
    const currentTime = Date.now();

    // 更新邮件列表并尝试选择邮件
    if (!cachedMails || !isEqual(cachedMails.data, fetchedMails)) {
      setMails(fetchedMails);
      setCachedMails({ data: fetchedMails, timestamp: currentTime });

      // 选择邮件的逻辑
      const selectedMailId = localStorage.getItem('selectedMailId');
      const selectedMail = fetchedMails.find(mail => String(mail.id) === selectedMailId) || fetchedMails[0];

      setConfig(prevConfig => ({
        ...prevConfig,
        selected: selectedMail ? selectedMail.id : null,
      }));
    }
  }, 1000, {
    leading: true,
    trailing: false,
  }));

  const refreshMails = useCallback(async () => {
    debouncedRefreshMailsRef.current();
  }, []);

  const loadAndSetMails = useCallback(async () => {
    const currentTime = Date.now();
    const cacheIsValid = cachedMails && (currentTime - cachedMails.timestamp < 3 * 60 * 1000);

    if (!cacheIsValid) {
      await refreshMails();
    } else if (cachedMails) {
      setMails(cachedMails.data);
    }
  }, [cachedMails, refreshMails]);

  useEffect(() => {
    loadAndSetMails();

    // 调整定时器间隔为每2分钟一次，与防抖延迟相匹配
    const intervalId = setInterval(loadAndSetMails, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [loadAndSetMails]);

  return { config, setConfig, mails, refreshMails, loadAndSetMails };
}
