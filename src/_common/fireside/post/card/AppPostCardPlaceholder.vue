<script lang="ts" setup>
import { AppPostCardAspectRatio } from '~common/fireside/post/card/AppPostCardBase.vue';

type Props = {
	aspectRatio?: number;
};
const { aspectRatio = AppPostCardAspectRatio } = defineProps<Props>();
</script>

<template>
	<div class="post-card">
		<div :style="{ 'padding-top': (1 / aspectRatio) * 100 + '%' }" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.post-card
	background-color: var(--theme-bg-subtle)
</style>
