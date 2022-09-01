<script lang="ts" setup>
import { PropType } from 'vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';

defineProps({
	icon: {
		type: String as PropType<Jolticon>,
		default: undefined,
	},
});
</script>

<template>
	<div class="-alert-box fill-backdrop">
		<div v-if="icon" class="-icon">
			<AppJolticon :icon="icon" />
		</div>
		<div class="-content">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-alert-box
	rounded-corners()
	display: flex
	flex-direction: row
	align-items: center
	padding: 24px
	grid-gap: 16px

.-content
	font-size: $font-size-small

.-icon
	color: var(--theme-highlight)

	.jolticon
		font-size: 24px
</style>
