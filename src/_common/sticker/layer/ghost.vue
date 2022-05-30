<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import {
	assignDrawerStoreGhostCallback as assignDrawerStoreMoveCallback,
	commitDrawerStoreItemPlacement,
	setDrawerStoreActiveItem,
	useDrawerStore,
} from '../../drawer/drawer-store';

@Options({})
export default class AppStickerLayerGhost extends Vue {
	drawer = shallowSetup(() => useDrawerStore());

	private isConfirmingPlacement = false;

	declare $el: HTMLDivElement;

	get sticker() {
		return this.drawer.sticker.value!;
	}

	get stickerSize() {
		return this.drawer.stickerSize.value;
	}

	get placedItem() {
		return this.drawer.placedItem.value;
	}

	get shouldShowStickerControls() {
		return !!this.placedItem;
	}

	private get itemRotation() {
		if (this.placedItem) {
			return `rotate(${this.placedItem.rotation * 90 - 45}deg)`;
		} else {
			return null;
		}
	}

	get itemStyling() {
		return {
			transform: this.itemRotation,
			width: this.stickerSize + 'px',
			height: this.stickerSize + 'px',
		};
	}

	get controlsStyling() {
		const controlSize = 32;
		return {
			left: this.stickerSize / 2 - controlSize / 2 + 'px',
			width: controlSize + 'px',
			height: controlSize + 'px',
		};
	}

	get itemClasses() {
		const classes = [];
		const { isDragging, targetController } = this.drawer;

		if (isDragging.value) {
			classes.push('-dragging');
		}

		if (targetController.value) {
			classes.push('-uncommitted');
		}

		return classes;
	}

	mounted() {
		assignDrawerStoreMoveCallback(this.drawer, this.updateGhostPosition);
	}

	async onConfirmPlacement() {
		// Only allow 1 placement request through at a time for each sticker
		// ghost. This component will be v-if'd away after placement if it
		// doesn't fail.
		if (this.isConfirmingPlacement) {
			return;
		}
		this.isConfirmingPlacement = true;
		Analytics.trackEvent('sticker-drawer', 'confirm-placement');
		await commitDrawerStoreItemPlacement(this.drawer);
		this.isConfirmingPlacement = false;
	}

	onStartDrag(event: MouseEvent | TouchEvent) {
		Analytics.trackEvent('sticker-drawer', 'start-drag');
		setDrawerStoreActiveItem(this.drawer, this.sticker, event, true);
	}

	updateGhostPosition(pos: { left: number; top: number }) {
		const { left, top } = pos;
		this.$el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
	}
}
</script>

<template>
	<div class="sticker-ghost" :class="itemClasses" @click.stop @contextmenu.prevent>
		<div class="-img-outer" @mousedown="onStartDrag" @touchstart="onStartDrag">
			<img
				class="-img-inner"
				draggable="false"
				style="user-drag: none"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>
		<transition name="-fade">
			<div v-if="shouldShowStickerControls" class="-controls" :style="controlsStyling">
				<AppButton
					icon="check"
					primary
					solid
					sparse
					circle
					@click.capture="onConfirmPlacement"
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.-uncommitted
	filter: drop-shadow(2px 2px 2.5px black)

.-dragging
	filter: drop-shadow(4px 4px 5px black)
	pointer-events: none

.sticker-ghost
	position: absolute
	top: 0
	left: 0
	cursor: grab
	touch-action: none

.-img
	&-outer
		z-index: 2

	&-inner
		display: block
		user-select: none
		width: 100%
		height: 100%

.-fade
	&-enter-active
		transition: opacity 250ms $strong-ease-out

	&-enter-from
		opacity: 0

	&-enter-to
		opacity: 1

.-controls
	rounded-corners()
	display: flex
	justify-content: center
	align-items: center
	position: absolute
	top: calc(100% + 8px)
	z-index: 1
</style>
