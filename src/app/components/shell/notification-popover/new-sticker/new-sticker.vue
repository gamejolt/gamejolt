<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppShellNotificationPopoverNewSticker extends Vue {
	@Prop({ type: String, required: true }) stickerImg!: string;

	declare $refs: {
		newSticker: HTMLDivElement;
	};

	mounted() {
		// TODO(vue3)
		// Self-destroy after animation finishes.
		this.$refs.newSticker.addEventListener('animationend', () => {
			this.$destroy();
			this.$el.parentNode?.removeChild(this.$el);
		});
	}
}
</script>

<template>
	<div ref="newSticker" class="-new-sticker">
		<img class="-new-sticker-img" :src="stickerImg" />
	</div>
</template>

<style lang="stylus" scoped>
$-size = 32px

.-new-sticker
	position: fixed
	width: $-size
	height: $-size
	animation-name: anim
	animation-duration: 1.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
	animation-timing-function: ease-out
	z-index: 4
	user-select: none
	pointer-events: none

	&-img
		display: block
		width: $-size
		height: $-size

@keyframes anim
	0%
		transform: none
		opacity: 0.5

	50%
		transform: translateY(100px) scale(1.5)
		opacity: 1

	55%
		transform: translateY(100px) scale(1.7) rotateZ(-20deg)

	60%
		transform: translateY(100px) scale(1.9) rotateZ(20deg)

	65%
		transform: translateY(100px) scale(2.1) rotateZ(-20deg)

	70%
		transform: translateY(100px) scale(2.3) rotateZ(20deg)
		opacity: 1

	100%
		transform: translateY(0) scale(0)
		opacity: 0
</style>
