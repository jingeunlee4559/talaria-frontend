import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE ||
  'http://localhost:8080';

const instance = axios.create({ baseURL });

export default instance;
