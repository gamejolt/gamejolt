<script lang="ts" setup>
import { computed, CSSProperties, ref } from 'vue';

import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import AppShellNoticeBase from '~common/shell/notice/_base/AppShellNoticeBase.vue';
import { StickerMasteryNotice } from '~common/shell/notice/notice.service';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import { $gettext } from '~common/translate/translate.service';
import { kBorderWidthLg, kFontSizeTiny } from '~styles/variables';
import { clampNumber } from '~utils/number';
import { sleep } from '~utils/utils';

interface BaseContent {
	type: string;
	percent: number;
}

interface TextContent extends BaseContent {
	type: 'text';
	text: string | number;
	styles?: CSSProperties;
}

interface StickerContent extends BaseContent {
	type: 'sticker';
}

interface JolticonContent extends BaseContent {
	type: 'jolticon';
	icon: Jolticon;
}

type PercentData = TextContent | StickerContent | JolticonContent;

type Props = {
	noticeId: number;
	data: StickerMasteryNotice;
};
const { noticeId, data } = defineProps<Props>();

const percentTransitionMs = 500;
const progressStrokeWidth = kBorderWidthLg.value * 2;
let squareInCircleData: { diameter: number; squareDimension: number } | undefined = undefined;

const masteryData = computed(() => {
	const maxProgress = Math.max(1, data.max);
	const progress = clampNumber(data.progress, 0, maxProgress);
	const isMax = progress >= maxProgress;

	const currentPercent = clampNumber(progress / maxProgress, 0, 1);
	const previousPercent = clampNumber(currentPercent - 1 / maxProgress, 0, 1);

	return {
		progress,
		maxProgress,
		/** 0 to 1 */
		currentPercent,
		/** 0 to 1 */
		previousPercent,
		isMax,
	};
});

const percentData = ref<PercentData & { key: number }>({
	key: 0,
	percent: masteryData.value.previousPercent,
	type: 'sticker',
});

function setPercentData(newData: PercentData) {
	percentData.value = {
		...newData,
		key: percentData.value.key + 1,
	};
}

const message = computed(() => {
	if (masteryData.value.isMax) {
		return $gettext(`You mastered this sticker!`);
	}
	return $gettext(`You gained some progress towards mastering this sticker.`);
});

const subtext = computed<string[]>(() => {
	const { progress, maxProgress, isMax } = masteryData.value;
	if (isMax) {
		return [$gettext(`It can be used as a reaction now.`)];
	}
	return [
		$gettext(`Place %{ count } more to master it.`, {
			count: Math.max(1, maxProgress - progress),
		}),
	];
});

async function afterIntroTransition() {
	const { currentPercent, isMax, previousPercent } = masteryData.value;
	const percent = isMax ? 1 : currentPercent;

	const progressGained = clampNumber(
		Math.round((currentPercent - previousPercent) * 100),
		0,
		100
	);

	if (isMax) {
		setPercentData({
			percent,
			type: 'jolticon',
			icon: 'star',
		});
	} else {
		setPercentData({
			percent,
			type: 'text',
			text: `+${progressGained}%`,
			styles: {
				fontSize: kFontSizeTiny.px,
			},
		});
	}

	await sleep(percentTransitionMs + 1_000);
	setPercentData({
		percent,
		type: 'sticker',
	});
}

function getSquareInCircle(diameter: number) {
	if (squareInCircleData?.diameter === diameter) {
		return squareInCircleData.squareDimension;
	}
	const progressSize = diameter - progressStrokeWidth * 2;
	const squareCircleMargin = 2;
	const squareDimension =
		Math.floor((Math.SQRT2 * (progressSize / 2)) / 1) - squareCircleMargin * 2;
	squareInCircleData = {
		diameter,
		squareDimension,
	};
	return squareDimension;
}
</script>

<template>
	<AppShellNoticeBase
		:notice-id="noticeId"
		:message="message"
		:auto-close-ms="5_000"
		@show-transition-end="afterIntroTransition()"
	>
		<template #leading="{ size: leadingSize }">
			<AppCircularProgress
				class="h-full w-full"
				:transition-ms="percentTransitionMs"
				:percent="percentData.percent"
				:stroke-width="progressStrokeWidth"
			>
				<Transition name="fade">
					<template v-if="percentData.type === 'text'">
						<span :key="percentData.key" :style="percentData.styles">
							{{ percentData.text }}
						</span>
					</template>
					<div
						v-else
						:key="percentData.key"
						class="flex items-center justify-center"
						:style="{
							width: `${getSquareInCircle(leadingSize)}px`,
							height: `${getSquareInCircle(leadingSize)}px`,
						}"
					>
						<template v-if="percentData.type === 'sticker'">
							<AppStickerImg class="h-full w-full" :src="data.sticker.img_url" />
						</template>
						<template v-else>
							<AppJolticon class="m-0 text-lg" :icon="percentData.icon" />
						</template>
					</div>
				</Transition>
			</AppCircularProgress>
		</template>

		<template #subtext>
			<template v-if="subtext.length">
				<div v-for="text of subtext" :key="text">
					{{ text }}
				</div>
			</template>
		</template>
	</AppShellNoticeBase>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 400ms $strong-ease-out, transform 400ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
	position: absolute

.fade-enter-from
	transform: translateY(20px)

.fade-leave-to
	transform: translateY(-20px)
</style>
