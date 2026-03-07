import CompTest from './component/demo-activity-root.vue'
import Animation from './animation/index.vue'
import TestScreenRecorder from "./test-screen-recorder.vue";
import NestTest from "./nest-test/index.vue"
import {RouteRecordRaw} from "vue-router";
import VueDepth from "./vue-depth/index.vue";

const routeConfig: RouteRecordRaw =  {
      path: '/demo',
      name: 'demo',
      children: [
        {
          path: 'comp-test',
          name: 'demo.comp-test',
          component: CompTest,

        },
        {
          path: 'vue-depth',
          name: 'demo.vue-depth',
          component: VueDepth,
        },
        {
          path: 'screen-record',
          name: 'demo.screen-record',
          component: TestScreenRecorder
        },
        {
          path: 'animation',
          name: 'demo.animation',
          component: Animation
        },
        {
          path: 'nest-test',
          name: 'demo.nest-test',
          component: NestTest
        }
      ]
    }

export  default  routeConfig;
