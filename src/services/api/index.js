import axios from "axios";

export const baseApi = axios.create({
    baseURL: process.env.API_URL,
})
