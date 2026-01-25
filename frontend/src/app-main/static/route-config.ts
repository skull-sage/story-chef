import { RouteRecordRaw } from 'vue-router';

const routeConfig: RouteRecordRaw = {
    path: '/post-static',
    name: 'post-static',
    component: () => import('./index.vue')
};

export default routeConfig;
