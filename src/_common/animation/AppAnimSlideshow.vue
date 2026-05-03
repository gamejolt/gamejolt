<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';

import AppAnimSlideshowImg from '~common/animation/AppAnimSlideshowImg.vue';
import { getImgSlideshowData, ImgSlideshow } from '~common/animation/slideshow/sheets';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { getElementOffset } from '~common/ruler/ruler-service';
import { styleWhen } from '~styles/mixins';
import { useResizeObserver } from '~utils/resize-observer';

type Props = {
	sheet: ImgSlideshow;
	overlay?: boolean;
	pause?: boolean;
	startOffset?: number;
};
const { sheet, overlay, pause, startOffset = 0 } = defineProps<Props>();

const root = useTemplateRef('root');
const size = ref({ width: 200, height: 200 });

const sheetData = computed(() => getImgSlideshowData(sheet));

useResizeObserver({
	target: root,
	callback: onDimensionsChanged,
});

function onDimensionsChanged() {
	if (!root.value) {
		return;
	}
	const { width, height } = getElementOffset(root.value);
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
