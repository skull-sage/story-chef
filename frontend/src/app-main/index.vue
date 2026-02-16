<script setup lang="ts">
import {useRouter} from 'vue-router'
import {ref} from "vue";

const router = useRouter();
const routeList = router.options.routes;
const selectedRoute = ref(routeList[1])

</script>

<template>
  <div class="full-width q-pa-xl ">
    <h1 class="text-h4 text-weight-medium">PlayBook Route List</h1>
    <div class="row q-gutter-lg">
      <div class="col-md-4">
        <div class="q-mb-md">
          Each applications are organized according to a root route.
          We will use named-route, hierarchy is established with dot(.) separation.
          As an example, for an application <b>zerometry</b>
          Routes could be [<i>zerometry</i>, <i>zerometry.todo-list</i>]
        </div>
        <q-list bordered separator round>
          <template v-for="aRoute in routeList" :key="aRoute.name">

            <q-item v-if="aRoute.children && aRoute.children.length" clickable
                  @click="selectedRoute = aRoute" >
              <q-item-section >
                <q-item-label :class="{'text-indigo': aRoute.name === selectedRoute.name}">
                  {{aRoute.name}}
                </q-item-label>
                <q-item-label  caption>
                  {{aRoute.children.length}} routes
                </q-item-label>
            </q-item-section>
            </q-item>
            <q-item
              clickable
              v-else
              :to="{name: aRoute.name}"
              active-class="text-indigo"
            >
              <q-item-section >
                <q-item-label>
                  {{aRoute.name}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>

        </q-list>
      </div>
      <div class="col-md-4">
        <q-list class="bg-blue-1 q-pa-md" separator>
          <div class="text-h6 text-bold q-mb-sm">{{selectedRoute.name}}</div>
          <q-item
            clickable
            v-for="item in selectedRoute.children"
            :key="item.name"
            :to="{name: item.name}"
            active-class="text-indigo"
          >
            <q-item-section>
              <q-item-label>{{item.name}}</q-item-label>
              <q-item-label caption> {{selectedRoute.path}}/{{item.path}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
