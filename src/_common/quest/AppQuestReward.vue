<script lang="ts">
import { computed } from 'vue';

import { formatNumber } from '~common/filters/number';
import { useOnHover } from '~common/on/useOnHover';
import AppQuestRewardThumbnail from '~common/quest/AppQuestRewardThumbnail.vue';
import {
	QuestRewardTypesAvatarFrame,
	QuestRewardTypesBackground,
	QuestRewardTypesCoin,
	QuestRewardTypesRandomSticker,
	QuestRewardTypesSiteTrophy,
	QuestRewardTypesSticker,
	QuestRewardTypesStickerPack,
	QuestRewardTypesUserCharge,
} from '~common/quest/quest-objective-reward-model';
import { QuestRewardModel } from '~common/quest/quest-reward-model';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { kThemeFg, kThemeFgMuted } from '~common/theme/variables';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
	styleLineClamp,
	styleOverlayTextShadow,
	styleTyped,
	styleWhen,
} from '~styles/mixins';
import { kFontSizeBase, kFontSizeTiny } from '~styles/variables';

const itemsWithCount = new Set([
	QuestRewardTypesSticker,
	QuestRewardTypesRandomSticker,
	QuestRewardTypesUserCharge,
	QuestRewardTypesCoin,
	QuestRewardTypesStickerPack,
]);
</script>

<script lang="ts" setup>
type Props = {
	reward: QuestRewardModel;
};
const { reward } = defineProps<Props>();

const displayCount = computed(() => {
	const { type, amount } = reward;
	if ((itemsWithCount.has(type) && amount >= 1) || amount > 1) {
		return `x${formatNumber(amount)}`;
	}
	return null;
});

const subtitle = computed(() => {
	if (reward.is_secret) {
		return $gettext(`Secret`);
	}

	switch (reward.type) {
		case QuestRewardTypesSticker:
			return $gettext(`Sticker`);
		case QuestRewardTypesSiteTrophy:
			return $gettext(`Trophy`);
		case QuestRewardTypesBackground:
			return $gettext(`Background`);
		case QuestRewardTypesStickerPack:
			return $gettext(`Sticker pack`);
		case QuestRewardTypesAvatarFrame:
			return $gettext(`Avatar frame`);
	}
	return null;
});

const { hovered, hoverBinding } = useOnHover();
</script>

<template>
	<div>
		<div
			v-bind="{ ...hoverBinding }"
			:style="
				styleTyped({
					...styleChangeBg('bg-offset'),
					...styleBorderRadiusLg,
					height: `100%`,
					padding: `12px 8px`,
					display: `flex`,
					flexDirection: `column`,
					alignItems: `center`,
					position: `relative`,
					...styleWhen(hovered, {
						...styleElevate(1),
					}),
				})
			"
		>
			<div :style="{ position: `relative`, width: `100%` }">
				<AppQuestRewardThumbnail :reward="reward" />

				<span
					v-if="displayCount"
					:style="{
						...styleOverlayTextShadow,
						position: `absolute`,
						right: 0,
						userSelect: `none`,
						top: `100%`,
						transform: `rotate(12.5deg)`,
						fontSize: kFontSizeBase.px,
						color: kThemeFg,
						fontWeight: `bold`,
					}"
				>
					{{ displayCount }}
				</span>
			</div>

			<AppSpacer vertical :scale="5" />

			<div
				v-app-tooltip.touchable="reward.name"
				:style="{
					...styleFlexCenter({
						direction: `column`,
					}),
					flex: `auto`,
					width: `100%`,
					textAlign: `center`,
				}"
			>
				<div
					:style="{
						...styleLineClamp(3),
					}"
				>
					{{ reward.name }}
				</div>

				<div
					v-if="subtitle"
					:style="{
						marginTop: `auto`,
						fontSize: kFontSizeTiny.px,
						fontStyle: `italic`,
						color: kThemeFgMuted,
						userSelect: `none`,
						...styleWhen(!subtitle, {
							visibility: `hidden`,
						}),
					}"
				>
					{{ subtitle }}
				</div>
			</div>
		</div>
	</div>
</template>
