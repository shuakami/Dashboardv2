/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, {useEffect, useState} from 'react';
import "@/styles/globals.css";
// @ts-ignore
import { TranslateIcon, LockClosedIcon } from "@heroicons/react/outline";
import {Badge} from "@/registry/new-york/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";


export default function PrivacyComponent() {
    // 初始化语言状态为英语，稍后将在useEffect中更新
    const [language, setLanguage] = useState('en');
    const [open, setOpen] = useState(false);

    const getDefaultLanguage = () => {
        if (typeof window !== 'undefined') {
            const storedLanguage = localStorage.getItem('userLanguage');
            if (storedLanguage) {
                return storedLanguage;
            }
            const browserLanguage = navigator.language;
            if (browserLanguage.includes('zh')) {
                console.log("detection-(zh)");
                return 'zh';
            } else if (browserLanguage.includes('ru')) {
                console.log("detection-ru");
                return 'ru';
            } else {
                console.log("detection-en");
                return 'en';
            }
        }
        return 'en'; // 默认返回英语
    };

    useEffect(() => {
        const detectedLanguage = getDefaultLanguage();
        console.log(`Set language: ${detectedLanguage}`);
        setLanguage(detectedLanguage);

        if (typeof window !== 'undefined') {
            localStorage.setItem('userLanguage', detectedLanguage);
        }
    }, []);



    // 隐私政策内容-多语言
    const content = {
        zh: {
            title: "隐私政策",
            introduction: "欢迎使用sdjz.wiki和ByteFreezeLab管理控制台（以下简称“控制台”）。控制台的所有权和运营权归属于其开发者（以下简称“我们”或“我们的”）。我们致力于保护使用控制台的用户（以下简称“您”或“用户”）的隐私和个人信息。本隐私政策旨在透明地说明我们如何收集、使用、保护以及在何种情况下可能披露您的信息。",
            informationCollection: "当您使用控制台时，我们可能会要求您提供能够识别您身份的个人信息，包括但不限于：昵称：用于在控制台内部识别您的用户身份。电子邮件地址：用于账户注册、密码恢复和发送重要的服务通知。",
            informationUse: "我们收集的信息主要用于以下目的：提供和维护控制台服务；通知您有关服务更新以及变更；改善用户体验和服务质量。",
            informationSharingDisclosure: "我们承诺不会将您的个人信息出售、出租或以任何形式向未经授权的第三方披露。我们可能在以下情况下共享您的信息：法律要求：当我们相信披露信息是为了遵守法律程序、执行我们的服务条款、保护我们的权利或保护我们的安全以及公众的安全时。安全和紧急情况：涉及到sdjz.wiki和ByteFreezeLab的安全或存亡时，我们可能需要访问或共享相关信息。",
            userRights: "您对您的个人信息享有以下权利：访问、更正或删除您的个人信息；在某些情况下，限制或反对我们使用您的信息。",
            dataStorageSecurity: "我们通过API技术存储个人信息，并致力于采取适当的安全措施保护您的信息免受未授权访问和泄露。尽管如此，由于网络传输的固有安全漏洞，我们不能保证信息的绝对安全。",
            policyChanges: "本隐私政策可能会不时更新。我们将通过控制台站内通知等方式尽力通知您任何重要变更。继续使用控制台将视为您接受了这些变更。",
            contact: "如果您对本隐私政策有任何疑问或关注，请通过以下方式联系我们：",
            github: "GitHub：github/shuakami",
            tg:"Telegram：@shuakami",
            copyrightStatement: "控制台的所有关键内容、系统信息及代码均归其作者所有，且为机密私有资产，未经许可不得以任何形式泄露或开源。",
            icon1: "生效于：2024/2/7",
            icon2: "更新于：2024/2/7",
            icon3: "审查通过"
        },
        en: {
            title: "Privacy Policy",
            introduction: "Welcome to the console managed by sdjz.wiki and ByteFreezeLab (\"the console\"). The ownership and operation rights of the console belong to its developers (\"we\" or \"our\"). We are committed to protecting the privacy and personal information of the users (\"you\" or \"user\") of the console. This Privacy Policy aims to transparently explain how we collect, use, protect, and under what circumstances may disclose your information.",
            informationCollection: "When you use the console, we may ask you to provide personal information that can identify you, including but not limited to: Nickname: Used to identify your user identity within the console. Email address: Used for account registration, password recovery, and sending important service notifications.",
            informationUse: "The information we collect is mainly used for the following purposes: To provide and maintain the console services; To notify you about service updates and changes; To improve user experience and service quality.",
            informationSharingDisclosure: "We promise not to sell, rent, or disclose your personal information to any unauthorized third parties in any form. We may share your information in the following situations: Legal requirements: When we believe that disclosure is necessary to comply with legal procedures, enforce our terms of service, protect our rights, or ensure the safety of us and the public. Safety and emergencies: In situations involving the safety or survival of sdjz.wiki and ByteFreezeLab, we may need to access or share relevant information.",
            userRights: "You have the following rights regarding your personal information: To access, correct, or delete your personal information; In some cases, to restrict or object to our use of your information.",
            dataStorageSecurity: "We store personal information through API technology and strive to take appropriate security measures to protect your information from unauthorized access and disclosure. Nonetheless, due to the inherent security vulnerabilities of internet transmission, we cannot guarantee the absolute security of the information.",
            policyChanges: "This Privacy Policy may be updated from time to time. We will do our best to notify you of any significant changes through console site notifications or other means. Continuing to use the console will be regarded as your acceptance of these changes.",
            contact: "If you have any questions or concerns about this Privacy Policy, please contact us via: ",
            icon1: "Effective:2024/2/7",
            icon2: "Update:2024/2/7",
            icon3: "Approved",
            github: "GitHub：github/shuakami",
            tg:"Telegram：@shuakami",
            copyrightStatement: "All key content, system information, and code of the console are owned by its author and are confidential private assets. Unauthorized disclosure or open sourcing in any form is prohibited."
        },
        ru: {
            title: "Политика конфиденциальности",
            introduction: "Добро пожаловать в консоль управления sdjz.wiki и ByteFreezeLab (далее «консоль»). Все права собственности и управления консолью принадлежат её разработчикам (далее «мы» или «наш»). Мы стремимся защитить конфиденциальность и личную информацию пользователей консоли (далее «вы» или «пользователь»). Настоящая Политика конфиденциальности призвана прозрачно объяснить, как мы собираем, используем, защищаем и в каких случаях можем раскрывать вашу информацию.",
            informationCollection: "Когда вы используете консоль, мы можем попросить вас предоставить личную информацию, которая может идентифицировать вас, включая, но не ограничиваясь: Никнейм: Используется для идентификации вашей пользовательской удентичности в консоли. Электронный адрес: Используется для регистрации аккаунта, восстановления пароля и отправки важных уведомлений о сервисе.",
            informationUse: "Собранная нами информация в основном используется для следующих целей: предоставление и поддержание сервиса консоли; уведомление вас о обновлениях сервиса и изменениях; улучшение пользовательского опыта и качества сервиса.",
            informationSharingDisclosure: "Мы обязуемся не продавать, не сдавать в аренду и не раскрывать вашу личную информацию неавторизованным третьим лицам в любой форме. Мы можем делиться вашей информацией в следующих случаях: По требованию закона: когда мы считаем, что раскрытие информации необходимо для соблюдения законодательной процедуры, исполнения наших условий обслуживания, защиты наших прав или безопасности нас и общественности. Безопасность и чрезвычайные ситуации: в ситуациях, затрагивающих безопасность или существование sdjz.wiki и ByteFreezeLab, мы можем потребоваться доступ к информации или её раскрытие.",
            userRights: "Вы обладаете следующими правами в отношении вашей личной информации: доступ, исправление или удаление вашей личной информации; в некоторых случаях ограничение или возражение против нашего использования вашей информации.",
            dataStorageSecurity: "Мы храним личную информацию с помощью технологии API и стремимся принимать соответствующие меры безопасности для защиты вашей информации от несанкционированного доступа и раскрытия. Тем не менее, из-за врожденных уязвимостей передачи данных по интернету, мы не можем гарантировать абсолютную безопасность информации.",
            policyChanges: "Настоящая Политика конфиденциальности может обновляться время от времени. Мы постараемся уведомить вас о любых значительных изменениях через уведомления в консоли или другими способами. Продолжение использования консоли будет рассматриваться как ваше согласие с этими изменениями.",
            contact: "Если у вас есть вопросы или опасения относительно настоящей Политики конфиденциальности, пожалуйста, свяжитесь с нами через:",
            github: "GitHub: github/shuakami",
            tg: "Telegram: @shuakami",
            copyrightStatement: "Все ключевые содержание, системная информация и код консоли принадлежат её автору и являются конфиденциальными частными активами. Раскрытие или открытый исходный код без разрешения в любой форме запрещено.",
            icon1: "Вступает в силу: 2024/2/7",
            icon2: "Обновлено: 2024/2/7",
            icon3: "Проверено и одобрено"
        }
    };

    const renderParagraphs = (text: string) => {
        return text.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                <br /><br />
            </React.Fragment>
        ));
    };

    const switchLanguage = (lang: string) => {
        setLanguage(lang);
        if (typeof window !== 'undefined') {
            if (lang === 'auto') {
                // 用户选择了“自动选择”，清除localStorage中的userLanguage键
                localStorage.removeItem('userLanguage');
                // 重新检测语言
                const detectedLanguage = getDefaultLanguage();
                setLanguage(detectedLanguage);
                localStorage.setItem('userLanguage', detectedLanguage);
                console.log(`Language automatically detected and switched to: ${detectedLanguage}`);
            } else {
                // 更新localStorage中的语言偏好
                localStorage.setItem('userLanguage', lang);
                console.log(`Language switched to: ${lang}`);
            }
          setOpen(false); // 关闭下拉菜单
        }
    };

    // 定义共享样式
    const sharedTransitionClass = "transition duration-200 ease-in-out";
    const sharedBorderNoneClass = "border-none";

    // @ts-ignore
    const currentContent = content[language];

    return (
      <div className="policy-container relative min-h-screen p-10 text-white"
           style={{fontFamily: 'Arial, sans-serif', maxWidth: 'max-w-3xl'}}>
        {/* 视频背景 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-0 top-0 h-full w-full object-cover"
          src="/video/background.mp4"
        />
        <div className="relative z-[1] mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold">{currentContent.title}</h1>
              <div className="mt-4 flex">
                <Badge variant="secondary">{currentContent.icon1}</Badge>
                <Badge className="ml-4">{currentContent.icon2}</Badge>
                <Badge variant="destructive" className="ml-4">{currentContent.icon3}</Badge>
              </div>
            </div>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <div style={{position: 'relative', zIndex: 999}}>
                  <TranslateIcon
                    className="h-5 w-5 text-white opacity-50 transition-opacity duration-200 hover:opacity-60"
                  />
                </div>
              </DropdownMenuTrigger>
              {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
              <DropdownMenuContent side="top"
                                   className="ml-4 border-none bg-white/70 p-1 backdrop-blur-md transition duration-200 ease-in-out dark:bg-[#121212]/80 dark:bg-opacity-80">
                <DropdownMenu aria-label="Language switcher">
                  <DropdownMenuGroup>
                    <DropdownMenuItem key="auto" onClick={() => switchLanguage('auto')}>
                      自动选择-Languageauto
                    </DropdownMenuItem>
                    <DropdownMenuItem key="zh" onClick={() => switchLanguage('zh')}>
                      中文
                    </DropdownMenuItem>
                    <DropdownMenuItem key="en" onClick={() => switchLanguage('en')}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem key="ru" onClick={() => switchLanguage('ru')}>
                      русский язык
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenu>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            {Object.keys(currentContent).filter(key => !['title', 'icon1', 'icon2', 'icon3'].includes(key)).map(key => (
              <p className="mb-4 text-lg" key={key}>{renderParagraphs(currentContent[key])}</p>
            ))}
          </div>
        </div>
      </div>
    );
}
