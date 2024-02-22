import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
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
    console.debug('Refreshing mails...');
    // 延时300毫秒后再刷新邮件列表，以模拟异步等待效果
    await new Promise(resolve => setTimeout(resolve, 300));
    const fetchedMails = await fetchMails();
    if (!isEqual(mails, fetchedMails)) {
      console.debug('New mails fetched on refresh, updating state...');
      setMails(fetchedMails);
    }
  };

  const loadAndSetMails = async () => {
    console.debug('Loading mails...');
    const fetchedMails = await fetchMails();
    if (!isEqual(mails, fetchedMails)) {
      console.debug('New mails fetched, updating state...');
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
    const interval = setInterval(loadAndSetMails, 3000); // 定期检查更新
    return () => clearInterval(interval); // 清理
  }, [mails, setConfig, setMails]);

  return { config, setConfig, mails, refreshMails };
}
