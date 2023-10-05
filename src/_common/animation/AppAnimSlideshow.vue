<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { useResizeObserver } from '../../utils/resize-observer';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { Ruler } from '../ruler/ruler-service';
import AppAnimSlideshowImg from './AppAnimSlideshowImg.vue';
import { ImgSlideshow, getImgSlideshowData } from './slideshow/sheets';

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
	startOffset: {
		type: Number,
		default: 0,
		validator: val => typeof val === 'number' && 0 <= val && val <= 1,
	},
});

const { sheet, overlay, pause, startOffset } = toRefs(props);

const root = ref<HTMLDivElement>();
const size = ref({ width: 200, height: 200 });

const sheetData = computed(() => getImgSlideshowData(sheet.value));

useResizeObserver({
	target: root,
	callback: onDimensionsChanged,
});

function onDimensionsChanged() {
	if (!root.value) {
		return;
	}
	const { width, height } = Ruler.offset(root.value);
	size.value = { width, height };
}
</script>

<template>
	<div
		ref="root"
		:style="{
			width: `100%`,
			height: `100%`,
			display: `flex`,
			alignItems: `center`,
			justifyContent: `center`,
			minHeight: 0,
			minWidth: 0,
		}"
	>
		<div
			:style="{
				width: `100%`,
				maxWidth: Math.min(size.width, size.height * sheetData.frameAspectRatio) + 'px',
			}"
		>
			<AppAspectRatio
				:ratio="sheetData.frameAspectRatio"
				:style="[
					{
						position: `relative`,
						zIndex: 1,
						overflow: `hidden`,
						width: `100%`,
					},
					styleWhen(overlay, {
						filter: `drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0px 1px 16px rgba(0, 0, 0, 0.09))`,
					}),
				]"
			>
				<AppAnimSlideshowImg
					:style="{
						position: `absolute`,
						height: `100%`,
						left: 0,
						top: 0,
						pointerEvents: `none`,
					}"
					:sheet="sheet"
					:pause="pause"
					:start-offset="startOffset"
				/>
			</AppAspectRatio>
		</div>
	</div>
</template>
