<script lang="ts" setup>
import AppAnimSlideshow from './AppAnimSlideshow.vue';
import { sheetChargeOrbBottom, sheetChargeOrbTop } from './slideshow/sheets';

defineProps({
	pause: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="charge-orb">
		<AppAnimSlideshow :pause="pause" :sheet="sheetChargeOrbBottom" />
		<AppAnimSlideshow class="-top" :pause="pause" :sheet="sheetChargeOrbTop" />
	</div>
</template>

<style lang="stylus" scoped>
.charge-orb
	position: relative

.-top
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
