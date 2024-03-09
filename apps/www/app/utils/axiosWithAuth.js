/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// src/utils/axiosWithAuth.js
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosWithAuth = axios.create();

axiosWithAuth.interceptors.request.use(async (config) => {
  const jwt = Cookies.get('jwt');
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosWithAuth;
