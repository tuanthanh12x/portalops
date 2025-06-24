// src/api/unauthAxios.js
import axios from "axios";

const unauthAxios = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 5000,
  withCredentials: true, // for cookie use
});

export default unauthAxios;
