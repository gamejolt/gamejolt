<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { StickerPlacement } from './placement/placement.model';
import { removeStickerFromTarget, StickerTargetController } from './target/target-controller';

@Options({})
export default class AppSticker extends Vue {
	@Prop({ type: Object, required: true }) sticker!: StickerPlacement;
	@Prop({ type: Object, default: null }) controller!: StickerTargetController | null;
	@Prop({ type: Boolean, default: true }) isClickable!: boolean;

	declare $refs: {
		outer: HTMLDivElement;
		live: HTMLDivElement;
		inner: HTMLImageElement;
	};

	@Emit('click')
	emitClick() {}

	get isLive() {
		return this.controller?.isLive === true;
	}

	mounted() {
		this.onUpdateStickerPlacement();
		if (this.isLive) {
			// Don't attach to the outer ref, since it may have an animation attached by its parent.
			this.$refs.live.addEventListener(
				'animationend',
				_ => {
					if (this.controller) {
						removeStickerFromTarget(this.controller, this.sticker);
					}
				},
				true
			);
		}
	}

	@Watch('sticker.position_x')
	@Watch('sticker.position_y')
	@Watch('sticker.rotation')
	async onUpdateStickerPlacement() {
		await nextTick();

		this.$refs.outer.style.left = `calc(${this.sticker.position_x * 100}% - 32px)`;
		this.$refs.outer.style.top = `calc(${this.sticker.position_y * 100}% - 32px)`;
		// Transform the inner element so the parent component can assign
		// translateY() while transitioning in
		this.$refs.inner.style.transform = `rotate(${this.sticker.rotation * 90 - 45}deg)`;
	}

	onClickRemove() {
		if (this.isClickable) {
			this.emitClick();
		}
	}
}
</script>

<template>
	<div ref="outer" class="-sticker" @click.stop="onClickRemove">
		<div
			ref="live"
			:class="{
				'-live': isLive,
			}"
		>
			<img
				ref="inner"
				draggable="false"
				onmousedown="return false"
				style="user-drag: none"
				:src="sticker.sticker.img_url"
				:class="{
					'-clickable': isClickable,
				}"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-base-scale = scale(0.8)

.-sticker
	position: absolute
	z-index: 2
	width: 64px
	height: 64px

	> *
	img
		display: block
		user-select: none
		width: 100%
		height: 100%

.-live
	// Keep this at 0 or the image may flicker before removing itself.
	opacity: 0
	transform: $-base-scale
	animation-name: live-fade
	animation-duration: 8.5s
	animation-timing-function: $strong-ease-out

.-clickable
	cursor: pointer

@keyframes live-fade
	0%
		opacity: 1
		transform: scale(1.2)

	10%
		opacity: 1
		transform: scale(1)

	60%
		opacity: 1
		transform: scale(1)

	100%
		opacity: 0
		transform: $-base-scale
</style>
