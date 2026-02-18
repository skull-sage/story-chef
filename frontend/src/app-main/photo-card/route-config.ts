import { RouteRecordRaw } from "vue-router";
import TextEditorDemo from "./text-editor-demo.vue";

const routeConfig: RouteRecordRaw =  {
      path: '/photo-card',
      name: 'photo-card',
      children: [
        {
          path: 'text-editor-demo',
          name: 'photo-card.text-editor-demo',
          component: TextEditorDemo
        }
      ]
}

export  default  routeConfig;
