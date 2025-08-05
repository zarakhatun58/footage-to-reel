import axios from "axios";

export const BASE_URL = "https://footage-flow-server.onrender.com";
//export const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;