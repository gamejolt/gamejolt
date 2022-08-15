<script lang="ts" setup>
import { PropType } from 'vue';
import AppTranslate from '../translate/AppTranslate.vue';

defineProps({
	size: {
		type: String as PropType<'md' | 'sm'>,
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
	text-shadow: none
	color: $white
	background-color: $gj-overlay-notice

	&:not(.-flat)
		box-shadow: 1px 1px 3px $black

	&.-md
		rounded-corners-lg()
		font-size: 21px

	&.-sm
		rounded-corners-sm()
		font-size: $font-size-tiny
		padding: 3px 6px
		letter-spacing: normal
</style>
