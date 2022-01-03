<script lang="ts" setup>
import { ref } from 'vue';

const hi = ref('hi');
</script>

<template>
	<div class="hi">{{ hi }}</div>
</template>

<style lang="stylus" scoped>
.hi
	color: rgba($black, 0.5)
</style>
