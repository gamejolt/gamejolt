<script lang="ts" setup>
import { PropType } from 'vue';
import { styleElevate, styleFlexCenter, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
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

		<div
			:style="{
				fontWeight: `bold`,
				marginTop: `16px`,
			}"
		>
			{{ collectible.name }}
		</div>

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
			<AppJolticon
				:style="{
					position: `relative`,
					zIndex: 1,
				}"
				icon="check"
			/>
			<div
				:style="[
					{
						position: `absolute`,
						width: `200%`,
						height: `20px`,
						backgroundColor: kThemeGjOverlayNotice,
						rotate: `-45deg`,
						zIndex: 0,
					},
					styleElevate(4),
				]"
			/>
		</div>
	</div>
</template>
