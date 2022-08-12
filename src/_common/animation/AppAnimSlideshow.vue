<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import { debounce } from '../../utils/utils';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { vAppObserveDimensions } from '../observe-dimensions/observe-dimensions.directive';
import { Ruler } from '../ruler/ruler-service';
import { ImgSlideshow } from './slideshow/sheets';

const props = defineProps({
	sheet: {
		type: Object as PropType<ImgSlideshow>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	pause: {
		type: Boolean,
	},
});

const { sheet, overlay, pause } = toRefs(props);

let timer: NodeJS.Timer | null = null;

const root = ref<HTMLDivElement>();

const frame = ref(0);

const offset = computed(() => {
	const { frames } = sheet.value;

	return (frame.value / frames) * 100;
});

const size = ref({ width: 200, height: 200 });

function initAnimator(fromStart = true) {
	if (pause.value) {
		return;
	}

	if (timer) {
		clearInterval(timer);

		if (fromStart) {
			frame.value = 0;
		}
	}

	timer = setInterval(() => {
		const { frames, blankFrames } = sheet.value;

		if (frame.value + 1 >= frames + blankFrames) {
			frame.value = 0;
		} else {
			++frame.value;
		}
	}, 1_000 / sheet.value.fps);
}

watch(sheet, () => initAnimator(true));

watch(pause, shouldPause => {
	if (shouldPause) {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	} else if (!timer) {
		initAnimator(false);
	}
});

onMounted(() => {
	onDimensionsChanged();
	initAnimator();
});

onUnmounted(() => {
	if (timer) {
		clearInterval(timer);
	}
});

const debounceDimensionsChanged = debounce(onDimensionsChanged, 500);

function onDimensionsChanged() {
	if (!root.value) {
		return;
	}
	const { width, height } = Ruler.offset(root.value);
	size.value = { width, height };
}
</script>

<template>
	<div ref="root" v-app-observe-dimensions="debounceDimensionsChanged" class="img-slideshow">
		<div
			class="-slideshow-container"
			:style="{
				maxWidth: Math.min(size.width, size.height * sheet.frameAspectRatio) + 'px',
			}"
		>
			<AppAspectRatio
				:ratio="sheet.frameAspectRatio"
				class="-slideshow"
				:class="{
					'-shadow': overlay,
				}"
			>
				<img
					class="-img"
					:src="sheet.asset"
					:style="{
						transform: `translateX(-${offset}%)`,
					}"
					draggable="false"
					alt=""
				/>
			</AppAspectRatio>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.img-slideshow
	width: 100%
	height: 100%
	display: flex
	align-items: center
	justify-content: center
	min-height: 0
	min-width: 0

.-slideshow-container
	width: 100%

.-slideshow
	position: relative
	z-index: 1
	overflow: hidden
	width: 100%

.-img
	position: absolute
	height: 100%
	transform: translateX(0)
	left: 0
	top: 0
	pointer-events: none
	z-index: -1

.-shadow
	filter: drop-shadow(0px 4px 8px rgba(black, 0.15)) drop-shadow(0px 4px 8px rgba(black, 0.15)) drop-shadow(0px 1px 16px rgba(black, 0.09))
</style>
