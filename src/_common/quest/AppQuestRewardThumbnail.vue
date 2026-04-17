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
import { QuestRewardTypes } from '~common/quest/quest-objective-reward-model';
import { QuestRewardModel } from '~common/quest/quest-reward-model';
import { StickerPackRatio } from '~common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '~common/store/common-store';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	reward: QuestRewardModel;
};
const { reward } = defineProps<Props>();

const { user: authUser } = useCommonStore();

const childInfo = computed<{ ratio: number; illString?: string; illAsset?: IllustrationAsset }>(
	() => {
		switch (reward.type) {
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
	if (reward.is_secret) {
		return 'other-os';
	}

	switch (reward.type) {
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

const iconStyles = {
	margin: 0,
	fontSize: `52px`,
} satisfies CSSProperties;
</script>

<template>
	<AppAspectRatio :ratio="1.25" :child-ratio="childInfo.ratio" show-overflow>
		<div v-if="reward.is_secret" class="flex items-center justify-center" :style="styleFill">
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
				:class="{ 'rounded-lg': reward.type === QuestRewardTypes.Background }"
				:media-item="reward.media"
				:style="styleFill"
			/>
		</template>
		<div v-else class="flex items-center justify-center" :style="styleFill">
			<AppJolticon :icon="icon" :style="iconStyles" />
		</div>
	</AppAspectRatio>
</template>
