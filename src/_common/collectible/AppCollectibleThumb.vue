<script lang="ts" setup>
import { PropType } from 'vue';
import { styleElevate, styleFlexCenter, styleLineClamp, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import { kThemeBgOffset, kThemeGjOverlayNotice } from '../theme/variables';
import { CollectibleModel, CollectibleType } from './collectible.model';

defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
			padding: `8px`,
			backgroundColor: kThemeBgOffset,
			borderRadius: kBorderRadiusLg.px,
			textAlign: `center`,
			overflow: `hidden`,
		}"
	>
		<!-- Image -->
		<AppAspectRatio :ratio="1">
			<img
				:style="[
					{
						width: `100%`,
						height: `auto`,
					},
					styleWhen(collectible.type === CollectibleType.Background, {
						borderRadius: kBorderRadiusBase.px,
					}),
				]"
				:src="collectible.image_url"
				alt=""
			/>
		</AppAspectRatio>

		<!-- Label -->
		<div
			:style="[
				styleLineClamp(2),
				{
					fontWeight: `bold`,
					marginTop: `16px`,
				},
			]"
		>
			{{ collectible.name }}
		</div>

		<template v-if="100">
			<AppSpacer vertical :scale="3" />
			<AppStickerMastery :progress="100" />
		</template>

		<!-- Unlocked ribbon -->
		<div
			:style="[
				styleFlexCenter(),
				{
					position: `absolute`,
					top: 0,
					left: 0,
					width: `36px`,
					height: `36px`,
				},
			]"
		>
			<AppJolticon :style="{ position: `relative`, zIndex: 1 }" icon="check" />
			<div
				:style="[
					styleElevate(4),
					{
						position: `absolute`,
						width: `200%`,
						height: `20px`,
						backgroundColor: kThemeGjOverlayNotice,
						rotate: `-45deg`,
						zIndex: 0,
					},
				]"
			/>
		</div>
	</div>
</template>
