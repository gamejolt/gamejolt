<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppAnimChargeOrb from '~common/animation/AppAnimChargeOrb.vue';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { DefaultAvatarFrameScale } from '~common/avatar/frame.model';
import { CurrencyType } from '~common/currency/currency-type';
import AppIllustration, { IllustrationAsset } from '~common/illustration/AppIllustration.vue';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppMediaItemImg from '~common/media-item/AppMediaItemImg.vue';
import { getMediaItemImageSrc } from '~common/media-item/media-item-model';
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
import { StickerPackRatio } from '~common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '~common/store/common-store';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '~styles/mixins';

type Props = {
	reward: QuestRewardModel;
};
const { reward } = defineProps<Props>();

const { user: authUser } = useCommonStore();

const childInfo = computed<{ ratio: number; illString?: string; illAsset?: IllustrationAsset }>(
	() => {
		switch (reward.type) {
			case QuestRewardTypesStickerPack:
				return { ratio: StickerPackRatio };
			case QuestRewardTypesCoin: {
				const asset = CurrencyType.coins.asset;
				if (typeof asset === 'string') {
					return { ratio: 1, illString: asset };
				}
				return { ratio: asset.width / asset.height, illAsset: asset };
			}
		}
		return { ratio: 1 };
	}
);

const icon = computed<Jolticon>(() => {
	if (reward.is_secret) {
		return 'other-os';
	}

	switch (reward.type) {
		case QuestRewardTypesSticker:
			return 'sticker-filled';
		case QuestRewardTypesSiteTrophy:
			return 'trophy';
		case QuestRewardTypesRandomSticker:
			return 'sticker-filled';
	}
	return 'gift';
});

const styleFill = {
	width: `100%`,
	height: `100%`,
} satisfies CSSProperties;

const iconWrapperStyles = {
	...styleFill,
	...styleFlexCenter(),
} satisfies CSSProperties;

const iconStyles = {
	margin: 0,
	fontSize: `52px`,
} satisfies CSSProperties;
</script>

<template>
	<AppAspectRatio :ratio="1.25" :child-ratio="childInfo.ratio" show-overflow>
		<div v-if="reward.is_secret" :style="iconWrapperStyles">
			<AppJolticon :icon="icon" :style="iconStyles" />
		</div>
		<AppIllustration
			v-else-if="childInfo?.illAsset"
			:asset="childInfo.illAsset"
			:style="styleFill"
		/>
		<img v-else-if="childInfo?.illString" :src="childInfo.illString" :style="styleFill" />
		<AppAnimChargeOrb
			v-else-if="reward.type === QuestRewardTypesUserCharge"
			:style="styleFill"
		/>
		<template v-else-if="reward.media">
			<AppUserAvatarBubble
				v-if="reward.type === QuestRewardTypesAvatarFrame"
				:user="authUser"
				disable-link
				show-frame
				smoosh
				:frame-override="{
					image_url: getMediaItemImageSrc(reward.media).src,
					scale: DefaultAvatarFrameScale,
				}"
			/>
			<AppMediaItemImg
				v-else
				:media-item="reward.media"
				:style="{
					...styleFill,
					...styleWhen(reward.type === QuestRewardTypesBackground, styleBorderRadiusLg),
				}"
			/>
		</template>
		<div v-else :style="iconWrapperStyles">
			<AppJolticon :icon="icon" :style="iconStyles" />
		</div>
	</AppAspectRatio>
</template>
