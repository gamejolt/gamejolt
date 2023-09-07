<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kFontSizeLarge, kFontSizeSmall } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import { kThemeFgMuted } from '../theme/variables';
import { $gettext } from '../translate/translate.service';
import { CollectibleModel, CollectibleType } from './collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
});

const { collectible } = toRefs(props);

const stickerMasteryInfo = computed(() => {
	if (typeof collectible.value.sticker_mastery !== 'number') {
		return undefined;
	}

	if (collectible.value.sticker_mastery === 0) {
		return $gettext(`You haven't used this sticker yet. Use it to gain mastery!`);
	}

	if (collectible.value.sticker_mastery !== 100) {
		return $gettext(
			`Use this sticker to gain mastery. Once you master it, you'll be able to use it for emojis and reactions!`,
			{
				progress: collectible.value.sticker_mastery,
			}
		);
	}

	return $gettext(`You've mastered this sticker and can now use it for emojis and reactions!`);
});

const headingStyles: CSSProperties = {
	textTransform: `uppercase`,
	fontSize: kFontSizeSmall.px,
	fontWeight: `bold`,
	margin: `0 0 8px 0`,
};

const mutedStyles: CSSProperties = {
	fontStyle: `italic`,
	color: kThemeFgMuted,
};
</script>

<template>
	<div
		:style="{
			display: `flex`,
			flexDirection: `column`,
			gap: `16px`,
			width: `250px`,
			padding: `16px`,
		}"
	>
		<!-- Label -->
		<div :style="{ textAlign: `center`, fontWeight: `bold`, fontSize: kFontSizeLarge.px }">
			{{ collectible.name }}
		</div>

		<!-- Image -->
		<div :style="{ width: `100%`, alignSelf: `center`, maxWidth: `200px` }">
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
		</div>

		<div v-if="collectible.type === CollectibleType.Sticker">
			<h2 :style="headingStyles">
				{{ $gettext(`Mastery`) }}
			</h2>

			<template v-if="typeof collectible.sticker_mastery === 'number'">
				<div
					:style="{
						flex: `none`,
						display: `flex`,
						flexDirection: `row`,
						alignItems: `center`,
						gap: `8px`,
					}"
				>
					<div :style="{ flex: `none`, fontSize: kFontSizeSmall.px }">
						{{ collectible.sticker_mastery }}%
					</div>
					<div :style="{ flex: `auto` }">
						<AppStickerMastery :progress="collectible.sticker_mastery" />
					</div>
				</div>

				<div
					:style="[
						mutedStyles,
						{
							marginTop: `4px`,
							fontSize: kFontSizeSmall.px,
						},
					]"
				>
					{{ stickerMasteryInfo }}
				</div>
			</template>
			<div v-else :style="mutedStyles">
				{{ $gettext(`This sticker can't be mastered.`) }}
			</div>
		</div>

		<div v-if="collectible.description">
			<h2 :style="headingStyles">
				{{ $gettext(`Description`) }}
			</h2>

			<div :style="mutedStyles">
				{{ collectible.description }}
			</div>
		</div>
	</div>
</template>
