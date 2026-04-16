<script lang="ts" setup>
import { computed, CSSProperties, HTMLAttributes, ref, useTemplateRef } from 'vue';

import { useResizeObserver } from '../../utils/resize-observer';
import { Ruler } from '../ruler/ruler-service';
import AppAnimSlideshow from './AppAnimSlideshow.vue';
import {
	getImgSlideshowData,
	ImgSlideshow,
	sheetShockRectBL,
	sheetShockRectTR,
	sheetShockSquare,
} from './slideshow/sheets';

type ShockAnimation = 'square' | 'wide-rect' | 'adaptive';

type Props = {
	shockAnim?: ShockAnimation;
	disabled?: boolean;
	ignoreAssetPadding?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onMousedown' | 'onTouchstart'>;

const { shockAnim = 'adaptive', disabled, ignoreAssetPadding } = defineProps<Props>();

const _squareSheet = sheetShockSquare;
const _rectSheets = [sheetShockRectBL, sheetShockRectTR];

const root = useTemplateRef('root');
const size = ref({ width: 200, height: 200 });

const chosenAsset = computed(() => {
	if (disabled) {
		return null;
	}

	const square = [_squareSheet];
	const wideRect = _rectSheets;

	switch (shockAnim) {
		case 'adaptive': {
			const { width, height } = size.value;
			if (width / 2 < height) {
				return square;
			}

			return wideRect;
		}

		case 'square':
			return square;

		case 'wide-rect':
			return wideRect;
	}
});

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

function getStyleForAsset(sheet: ImgSlideshow): CSSProperties {
	const { width, height } = size.value;
	const { frameAspectRatio } = getImgSlideshowData(sheet);

	const isBL = sheet === sheetShockRectBL;
	const isTR = sheet === sheetShockRectTR;

	if (!isBL && !isTR) {
		// Square asset has roughly 25% padding between the asset and the visual
		// "edge" of the electricity.
		const inset = ignoreAssetPadding ? 0 : '-25%';
		return {
			left: inset,
			top: inset,
			right: inset,
			bottom: inset,
		};
	}

	// Trying to offset the animation asset so it aligns with the edge of the
	// actual widget we're overlaying.
	const extraVertical = ignoreAssetPadding ? 0 : 0.4;
	const extraHorizontal = ignoreAssetPadding ? 0 : 0.115;

	let offsetY = `${extraVertical * 100}%`;
	let offsetX = `${extraHorizontal * 100}%`;
	let pos: CSSProperties;

	if (isBL) {
		offsetX = `-${offsetX}`;
		pos = { bottom: 0, left: 0 };
	} else {
		offsetY = `-${offsetY}`;
		pos = { top: 0, right: 0 };
	}

	const offset: CSSProperties = ignoreAssetPadding
		? {}
		: {
				transform: `translate3d(${offsetX}, ${offsetY}, 0)`,
		  };

	return {
		...pos,
		width: `calc(min(100%, ${height}px * ${frameAspectRatio}))`,
		height: `calc(min(100%, ${width}px / ${frameAspectRatio}))`,
		...offset,
	};
}
</script>

<template>
	<div ref="root" :style="{ position: `relative` }">
		<slot />

		<template v-if="chosenAsset">
			<div
				v-for="(sheet, index) of chosenAsset"
				:key="sheet.asset + `-${index}`"
				:style="[
					{
						position: `absolute`,
						zIndex: 1,
						pointerEvents: `none`,
					},
					getStyleForAsset(sheet),
				]"
			>
				<AppAnimSlideshow :sheet="sheet" />
			</div>
		</template>
	</div>
</template>
