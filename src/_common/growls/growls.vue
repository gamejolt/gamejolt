<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import AppGrowl from './growl.vue';
import { Growls } from './growls.service';

@Options({
	components: {
		AppGrowl,
	},
})
export default class AppGrowls extends Vue {
	readonly Growls = Growls;
	readonly Screen = Screen;
}
</script>

<template>
	<div class="growl-container">
		<transition-group>
			<!-- TODO(vue3): check to make sure this didn't break -->
			<app-growl
				v-for="(growl, index) of Growls.growls"
				:key="index"
				:growl="growl"
				:index="index"
				:class="{
					'anim-fade-enter-left anim-fade-leave-left': !Screen.isXs,
					'anim-fade-enter-down anim-back-leave-down': Screen.isXs,
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
