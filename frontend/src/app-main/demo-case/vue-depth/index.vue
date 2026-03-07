<template>
  <div class="demo-case-js-depth">
    <h2>JS Depth Demo</h2>
    <p>This demo showcases the depth of JavaScript objects and their interactions.</p>
    <!-- Add your demo content here -->
    <!-- <ChildComp v-model="sample" /> -->
  </div>
</template>
<script lang="ts" setup>
import { shallowReactive, toRaw } from 'vue';
import ChildComp from './child-comp.vue';

const sample = {
  name: "Rashed",
  age: 30,
}

const shallowA = shallowReactive(sample);
const shallowB = shallowReactive(sample);

console.log(shallowA === shallowB); // true
console.log(toRaw(shallowA) === toRaw(shallowB)); // "true"


</script>
