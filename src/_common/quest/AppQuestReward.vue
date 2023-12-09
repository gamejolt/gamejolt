<script lang="ts">
import { PropType, computed, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
	styleLineClamp,
	styleOverlayTextShadow,
	styleTyped,
	styleWhen,
} from '../../_styles/mixins';
import { kFontSizeBase, kFontSizeTiny } from '../../_styles/variables';
import { formatNumber } from '../filters/number';
import { useOnHover } from '../on/useOnHover';
import AppSpacer from '../spacer/AppSpacer.vue';
import { kThemeFg, kThemeFgMuted } from '../theme/variables';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { $gettext } from '../translate/translate.service';
import AppQuestRewardThumbnail from './AppQuestRewardThumbnail.vue';
import { QuestRewardTypes } from './quest-objective-reward-model';
import { QuestRewardModel } from './quest-reward-model';

const itemsWithCount = new Set([
	QuestRewardTypes.Sticker,
	QuestRewardTypes.RandomSticker,
	QuestRewardTypes.UserCharge,
	QuestRewardTypes.Coin,
	QuestRewardTypes.StickerPack,
]);
</script>

<script lang="ts" setup>
const props = defineProps({
	reward: {
		type: Object as PropType<QuestRewardModel>,
		required: true,
	},
});

const { reward } = toRefs(props);

const displayCount = computed(() => {
	const { type, amount } = reward.value;
	if ((itemsWithCount.has(type) && amount >= 1) || amount > 1) {
		return `x${formatNumber(amount)}`;
	}
	return null;
});

const subtitle = computed(() => {
	if (reward.value.is_secret) {
		return $gettext(`Secret`);
	}

	switch (reward.value.type) {
		case QuestRewardTypes.Sticker:
			return $gettext(`Sticker`);
		case QuestRewardTypes.SiteTrophy:
			return $gettext(`Trophy`);
		case QuestRewardTypes.Background:
			return $gettext(`Background`);
		case QuestRewardTypes.StickerPack:
			return $gettext(`Sticker pack`);
		case QuestRewardTypes.AvatarFrame:
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
