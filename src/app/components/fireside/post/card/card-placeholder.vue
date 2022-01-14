<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { AppPostCardAspectRatio } from './card.vue';

@Options({})
export default class AppPostCardPlaceholder extends Vue {
	readonly aspectRatio = AppPostCardAspectRatio;
}
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
