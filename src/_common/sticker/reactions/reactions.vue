<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { numberSort } from '../../../utils/array';
import { shallowSetup } from '../../../utils/vue';
import { useDrawerStore } from '../../drawer/drawer-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { StickerTargetController, toggleStickersShouldShow } from '../target/target-controller';
import AppStickerReactionsItem from './item.vue';

@Options({
	components: {
		AppStickerReactionsItem,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppStickerReactions extends Vue {
	@Prop({ type: Object, required: true }) controller!: StickerTargetController;

	drawerStore = shallowSetup(() => useDrawerStore());

	@Emit('show') emitShow() {}

	private animate = false;

	get canShowBorder() {
		return !this.controller.isLive;
	}

	get showAsActive() {
		return this.canShowBorder && this.controller.shouldShow.value;
	}

	get shouldAnimate() {
		return this.animate;
	}

	get reactions() {
		return [...this.controller.model.sticker_counts].sort((a, b) =>
			numberSort(b.count, a.count)
		);
	}

	mounted() {
		//  Wait for a little bit before setting this. We want new reactions to
		//  animate themselves, but not the initial ones.
		setTimeout(() => {
			this.animate = this.controller.isLive;
		}, 1_000);
	}

	onClick() {
		// Stickers in a Live context will automatically remove themselves - do nothing.
		if (this.controller.isLive) {
			return;
		}

		toggleStickersShouldShow(this.controller, true);

		if (this.controller.shouldShow.value) {
			this.emitShow();
		}
	}
}
</script>

<template>
	<div
		v-app-tooltip="controller.isLive ? null : $gettext(`View Stickers`)"
		class="sticker-reactions"
		:class="{
			'-active': showAsActive,
			'-live': controller.isLive,
		}"
		@click.stop="onClick"
	>
		<AppStickerReactionsItem
			v-for="{ stickerId, imgUrl, count } of reactions"
			:key="stickerId"
			:img-url="imgUrl"
			:count="count"
			:animate="shouldAnimate"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-reactions
	display: inline-flex
	flex-wrap: wrap
	margin: 4px 0 8px 0
	border: $border-width-small solid transparent

	&:not(.-live)
		cursor: pointer

		&:hover
			rounded-corners()
			background-color: var(--theme-bg-offset)

.-active
	rounded-corners()
	background-color: var(--theme-bg-offset)
	border-color: var(--theme-backlight)
</style>
