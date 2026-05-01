<script lang="ts" setup>
import AppGrowl from '~common/growls/AppGrowl.vue';
import { Growls } from '~common/growls/growls.service';
import { getScreen } from '~common/screen/screen-service';

const { growls } = Growls;
const { isXs } = getScreen();
</script>

<template>
	<div class="growl-container">
		<transition-group>
			<AppGrowl
				v-for="(growl, index) of growls"
				:key="index"
				:growl="growl"
				:index="index"
				:class="{
					'anim-fade-enter-left anim-fade-leave-left': !isXs,
					'anim-fade-enter-down anim-back-leave-down': isXs,
				}"
			/>
		</transition-group>
	</div>
</template>

<style lang="stylus" scoped>
.growl-container
	position: fixed
	bottom: $growl-spacing
	left: 0
	right: 0
	z-index: $zindex-growls

	@media $media-sm-up
		right: auto
		width: $growl-width
</style>
