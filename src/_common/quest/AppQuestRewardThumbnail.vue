<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '../../_styles/mixins';
import AppAnimChargeOrb from '../animation/AppAnimChargeOrb.vue';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { DefaultAvatarFrameScale } from '../avatar/frame.model';
import { CurrencyType } from '../currency/currency-type';
import AppIllustration, { IllustrationAsset } from '../illustration/AppIllustration.vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppMediaItemImg from '../media-item/AppMediaItemImg.vue';
import { getMediaItemImageSrc } from '../media-item/media-item-model';
import { StickerPackRatio } from '../sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../store/common-store';
import AppUserAvatarBubble from '../user/user-avatar/AppUserAvatarBubble.vue';
import { QuestRewardTypes } from './quest-objective-reward-model';
import { QuestRewardModel } from './quest-reward-model';

const props = defineProps({
	reward: {
		type: Object as PropType<QuestRewardModel>,
		required: true,
	},
});

const { reward } = toRefs(props);

const { user: authUser } = useCommonStore();

const childInfo = computed<{ ratio: number; illString?: string; illAsset?: IllustrationAsset }>(
	() => {
		switch (reward.value.type) {
			case QuestRewardTypes.StickerPack:
				return { ratio: StickerPackRatio };
			case QuestRewardTypes.Coin: {
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
	if (reward.value.is_secret) {
		return 'other-os';
	}

	switch (reward.value.type) {
		case QuestRewardTypes.Sticker:
			return 'sticker-filled';
		case QuestRewardTypes.SiteTrophy:
			return 'trophy';
		case QuestRewardTypes.RandomSticker:
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
			v-else-if="reward.type === QuestRewardTypes.UserCharge"
			:style="styleFill"
		/>
		<template v-else-if="reward.media">
			<AppUserAvatarBubble
				v-if="reward.type === QuestRewardTypes.AvatarFrame"
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
					...styleWhen(reward.type === QuestRewardTypes.Background, styleBorderRadiusLg),
				}"
			/>
		</template>
		<div v-else :style="iconWrapperStyles">
			<AppJolticon :icon="icon" :style="iconStyles" />
		</div>
	</AppAspectRatio>
</template>
