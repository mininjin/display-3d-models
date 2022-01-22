<template>
  <three />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Three from "./components/Three.vue";

export default defineComponent({
  name: "App",
  components: {
    Three,
  },
});
</script>