import { RouteRecordRaw } from "vue-router";
import TextEditorDemo from "./text-editor-demo.vue";

const routeConfig: RouteRecordRaw =  {
      path: '/block-text',
      name: 'block-text',
      component: TextEditorDemo
}

export  default  routeConfig;
