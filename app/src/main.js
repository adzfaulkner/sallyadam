import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store';
import axios from 'axios';
import 'simplycountdown.js/dev/simplyCountdown';
import 'animate.css';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NODE_ENV !== 'development' ? process.env.VUE_APP_API_BASE_URL : '';

createApp(App)
    .use(router)
    .use(store)
    .mount('#app');