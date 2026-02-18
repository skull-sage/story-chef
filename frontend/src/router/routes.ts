import { RouteRecordRaw } from 'vue-router';
import DemoRoute from 'src/app-main/demo-examples/route-config'
import StaticRoute from "src/app-main/static/route-config"
import Index from 'src/app-main/index.vue'
import ObjNodes from 'src/app-main/obj-nodes/route-config'


const routes: RouteRecordRaw[] = [
  /* {
     path: '/',
     component: () => import('layouts/MainLayout.vue'),
     children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
   },*/
  {
    path: '',
    name: 'index',
    component: Index
  },
  {
    ...ObjNodes
  },
  {
    ...DemoRoute
  },
  {
    ...StaticRoute
  },
  {
    path: '/:catchAll(.*)*',
    name: 'catch-all',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
