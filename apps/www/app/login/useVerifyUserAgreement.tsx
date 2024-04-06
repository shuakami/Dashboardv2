/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/registry/new-york/ui/alert-dialog';

// @ts-ignore
const useVerifyUserAgreement = (jwt) => {
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');

  useEffect(() => {
    if (!jwt) return;

    const verifyAgreements = async () => {
      try {
        const userInfoResponse = await axios.get('https://xn--7ovw36h.love/api/users/me', {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const { AgreedPrivacy, AgreedTerms } = userInfoResponse.data;
        const resContentsResponse = await axios.get('https://xn--7ovw36h.love/api/rescontents', {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const { privacyversion, termsversion, termscontent, privacycontent } = resContentsResponse.data;

        if (AgreedPrivacy !== privacyversion) {
          setPrivacyContent(privacycontent);
          setIsPrivacyDialogOpen(true);
        }

        if (AgreedTerms !== termsversion) {
          setTermsContent(termscontent);
          setIsTermsDialogOpen(true);
        }
      } catch (error) {
        console.error('Error verifying user agreements:', error);
      }
    };

    verifyAgreements();
  }, [jwt]);

  const PrivacyAlertDialog = () => (
    <AlertDialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>隐私政策更新</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: privacyContent }} />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsPrivacyDialogOpen(false)}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsPrivacyDialogOpen(false)}>我同意</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const TermsAlertDialog = () => (
    <AlertDialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>服务协议更新</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: termsContent }} />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsTermsDialogOpen(false)}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsTermsDialogOpen(false)}>我同意</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { PrivacyAlertDialog, TermsAlertDialog };
};

export default useVerifyUserAgreement;
