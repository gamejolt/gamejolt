<script lang="ts" setup>
import { PropType } from 'vue';
import AppTranslate from '../translate/AppTranslate.vue';

defineProps({
	size: {
		type: String as PropType<'sm' | 'md' | 'lg'>,
		default: 'md',
	},
});
</script>

<template>
	<div class="fireside-live-tag" :class="[`-${size}`]">
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
	box-shadow: 1px 1px 3px $black
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice

	&.-lg
		rounded-corners-lg()
		font-size: $font-size-h1

	&.-md
		rounded-corners-lg()
		font-size: $font-size-h2

	&.-sm
		rounded-corners()
		font-size: $font-size-h3
</style>
