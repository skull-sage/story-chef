<template>
  <div class="child-comp">
    <input
      v-model="localData"
      type="text"
      placeholder="Edit data"
      @input="emitChanges"
    />
    <p>Current value: {{ localData }}</p>
  </div>
</template>

<script>
export default {
  name: 'ChildComp',
  props: {
    sampleData: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localData: this.sampleData
    };
  },
  watch: {
    sampleData(newVal) {
      this.localData = newVal;
    }
  },
  methods: {
    emitChanges() {
      this.$emit('update:sampleData', this.localData);
    }
  }
};
</script>

<style scoped>
.child-comp {
  padding: 10px;
  border: 1px solid #ccc;
}

input {
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
}
</style>