<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { styleElevate, styleFlexCenter, styleLineClamp, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import { kThemeBgOffset, kThemeGjOverlayNotice } from '../theme/variables';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { $gettext } from '../translate/translate.service';
import { CollectibleModel, CollectibleType } from './collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
});

const { collectible } = toRefs(props);

const stickerMasteryTooltip = computed(() => {
	if (typeof collectible.value.sticker_mastery !== 'number') {
		return undefined;
	}

	if (collectible.value.sticker_mastery === 0) {
		return $gettext(`You haven't used this sticker yet. Use it to gain mastery!`);
	}

	if (collectible.value.sticker_mastery !== 100) {
		return $gettext(
			`You're %{ progress }% of the way to mastering this sticker. Use it more to gain mastery. Once you master it, you'll be able to use it for emojis and reactions!`,
			{
				progress: collectible.value.sticker_mastery,
			}
		);
	}

	return $gettext(`You've mastered this sticker and can now use it for emojis and reactions!`);
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
			display: `flex`,
			flexDirection: `column`,
		}"
	>
		<div
			:style="{
				flex: `auto`,
				display: `flex`,
				flexDirection: `column`,
				gap: `16px`,
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
					},
				]"
			>
				{{ collectible.name }}
			</div>
		</div>

		<div
			v-if="typeof collectible.sticker_mastery === 'number'"
			v-app-tooltip="stickerMasteryTooltip"
			:style="{
				flex: `none`,
				paddingTop: `12px`,
				cursor: `help`,
			}"
		>
			<AppStickerMastery :progress="collectible.sticker_mastery" />
		</div>

		<!-- Unlocked ribbon -->
		<div
			v-if="collectible.is_unlocked"
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
