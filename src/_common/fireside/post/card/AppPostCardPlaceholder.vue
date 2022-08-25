<script lang="ts" setup>
import { AppPostCardAspectRatio } from './AppPostCardBase.vue';
</script>

<template>
	<div class="post-card">
		<div :style="{ 'padding-top': (1 / AppPostCardAspectRatio) * 100 + '%' }" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.post-card
	background-color: var(--theme-bg-subtle)
</style>
