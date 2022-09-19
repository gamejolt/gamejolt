<script lang="ts" setup>
import AppAnimSlideshow from './AppAnimSlideshow.vue';
import { sheetChargeOrbBottom, sheetChargeOrbTop } from './slideshow/sheets';

const props = defineProps({
	pause: {
		type: Boolean,
	},
	useRandomOffset: {
		type: Boolean,
	},
});

const bottomOffset = props.useRandomOffset ? Math.random() : undefined;
const topOffset = props.useRandomOffset ? Math.random() : undefined;
</script>

<template>
	<div class="charge-orb">
		<AppAnimSlideshow
			:pause="pause"
			:sheet="sheetChargeOrbBottom"
			:start-offset="bottomOffset"
		/>
		<AppAnimSlideshow
			class="-top"
			:pause="pause"
			:sheet="sheetChargeOrbTop"
			:start-offset="topOffset"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.charge-orb
	position: relative

.-bottom
	z-index: 1

.-top
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 2
</style>
