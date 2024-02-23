import { atom, useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { fetchMails, Mail } from '@/app/content/mail/data';

// @ts-ignore
import isEqual from 'lodash/isEqual';

type Config = {
  selected: string | null;
};

const configAtom = atom<Config>({
  selected: null,
});

export function useMail() {
  const [config, setConfig] = useAtom(configAtom);
  const [mails, setMails] = useState<Mail[]>([]);

  const refreshMails = async () => {
    const fetchedMails = await fetchMails();
    // 无条件更新状态，不检查是否有变化
    setMails(fetchedMails);
  };


  const loadAndSetMails = async () => {
    const fetchedMails = await fetchMails();
    if (!isEqual(mails, fetchedMails)) { // 仅在数据变化时更新
      setMails(fetchedMails);

      const selectedMailId = localStorage.getItem('selectedMailId');
      const selectedMail = fetchedMails.find(mail => String(mail.id) === selectedMailId) || fetchedMails[0];

      setConfig(prevConfig => ({
        ...prevConfig,
        selected: selectedMail ? selectedMail.id : null,
      }));
    }
  };

  useEffect(() => {
    loadAndSetMails(); // 初始加载

    const interval = setInterval(loadAndSetMails, 5000); // 定期检查更新

    return () => clearInterval(interval); // 清理
  }, [mails, setConfig, setMails]);

  return { config, setConfig, mails, refreshMails,loadAndSetMails };
}
