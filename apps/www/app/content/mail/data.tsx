import axios from 'axios';
import React from 'react';

// Define types for the fetched data
export type Mail = {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
  CCID: string;
  archive?: boolean;
};

export type Account = {
  label: string;
  email: string;
  icon: JSX.Element;
};

export type Contact = {
  name: string;
  email: string;
};

// Async functions to fetch data from the API
export async function fetchMails(): Promise<Mail[]> {
  const response = await axios.get('https://xn--7ovw36h.love/api/mails');
  return response.data.data.map((mail: any) => ({
    id: mail.id,
    name: mail.attributes.name,
    email: mail.attributes.email,
    subject: mail.attributes.subject,
    text: mail.attributes.text,
    date: mail.attributes.date,
    read: false, // Assuming all emails are unread initially; adjust as needed
    labels: mail.attributes.labels.split(','),
    archive: mail.attributes.archive === "true" ? true : false, // Convert "true" string to boolean
  }));
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await axios.get('https://xn--7ovw36h.love/api/accounts');
  return response.data.data.map((account: any) => ({
    label: account.attributes.label,
    email: account.attributes.email,
    icon: React.createElement("div", { dangerouslySetInnerHTML: { __html: account.attributes.icon } }),
  }));
}

export async function fetchContacts(): Promise<Contact[]> {
  const response = await axios.get('https://xn--7ovw36h.love/api/contacts');
  return response.data.data.map((contact: any) => ({
    name: contact.attributes.name,
    email: contact.attributes.email,
  }));
}
