<script lang="ts" setup>
import { PropType } from 'vue';
import AppTranslate from '../translate/AppTranslate.vue';

defineProps({
	size: {
		type: String as PropType<'lg' | 'md' | 'sm' | 'tiny'>,
		default: 'md',
	},
	sansElevation: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="fireside-live-tag" :class="{ [`-${size}`]: true, '-flat': sansElevation }">
		<AppTranslate>LIVE</AppTranslate>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-live-tag
	margin: 0
	padding: 4px 8px
	font-weight: 700
	font-family: $font-family-heading
	text-shadow: none
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice

	&:not(.-flat)
		box-shadow: 1px 1px 3px $black

	&.-lg
		rounded-corners-lg()
		font-size: $font-size-h1

	&.-md
		rounded-corners-lg()
		font-size: $font-size-h2

	&.-sm
		rounded-corners()
		font-size: $font-size-h3

	&.-tiny
		rounded-corners-sm()
		font-size: $font-size-tiny
		padding: 3px 6px
		letter-spacing: normal
		font-weight: normal
</style>
