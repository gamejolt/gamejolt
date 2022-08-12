<script lang="ts" setup>
import { computed, onMounted, PropType, ref, toRefs } from 'vue';
import { numberSort } from '../../../utils/array';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { StickerTargetController, toggleStickersShouldShow } from '../target/target-controller';
import AppStickerReactionsItem from './AppStickerReactionsItem.vue';

const props = defineProps({
	controller: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
});

const emit = defineEmits({
	show: () => true,
});

const { controller } = toRefs(props);

const animate = ref(false);

const canShowBorder = computed(() => !controller.value.isLive);

const showAsActive = computed(() => canShowBorder.value && controller.value.shouldShow.value);

const shouldAnimate = computed(() => animate.value);

const reactions = computed(() =>
	[...controller.value.model.sticker_counts].sort((a, b) => numberSort(b.count, a.count))
);

onMounted(() => {
	//  Wait for a little bit before setting this. We want new reactions to
	//  animate themselves, but not the initial ones.
	setTimeout(() => {
		animate.value = controller.value.isLive;
	}, 1_000);
});

function onClick() {
	// Stickers in a Live context will automatically remove themselves - do nothing.
	if (controller.value.isLive) {
		return;
	}

	toggleStickersShouldShow(controller.value, true);

	if (controller.value.shouldShow.value) {
		emit('show');
	}
}
</script>

<template>
	<div class="sticker-reactions">
		<div
			v-app-tooltip="controller.isLive ? null : $gettext(`View stickers`)"
			class="-content"
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
	</div>
</template>

<style lang="stylus" scoped>
.sticker-reactions
	display: inline-block
	margin: 4px 0 8px 0

.-content
	display: inline-flex
	flex-wrap: wrap
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
