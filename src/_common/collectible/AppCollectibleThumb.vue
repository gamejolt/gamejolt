<script lang="ts" setup>
import { PropType } from 'vue';
import { styleElevate, styleFlexCenter, styleLineClamp, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg, kStrongEaseOut } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppPopper from '../popper/AppPopper.vue';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import { kThemeBgOffset, kThemeGjOverlayNotice } from '../theme/variables';
import AppCollectibleThumbDetails from './AppCollectibleThumbDetails.vue';
import { CollectibleModel, CollectibleType } from './collectible.model';

defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
});
</script>

<template>
	<AppPopper trigger="hover" placement="right-start" no-hover-popover>
		<template #default="{ isShowingPopper }">
			<div
				:style="[
					{
						position: `relative`,
						padding: `8px`,
						backgroundColor: kThemeBgOffset,
						borderRadius: kBorderRadiusLg.px,
						textAlign: `center`,
						overflow: `hidden`,
						display: `flex`,
						flexDirection: `column`,
						transition: `transform 250ms ${kStrongEaseOut}`,
					},
					styleWhen(isShowingPopper, {
						transform: `rotate(-5deg) scale(0.9)`,
						...styleElevate(4),
						transition: `transform 250ms ${kStrongEaseOut}`,
						zIndex: 2,
					}),
				]"
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
								userSelect: `none`,
							},
						]"
					>
						{{ collectible.name }}
					</div>
				</div>

				<div
					v-if="typeof collectible.sticker_mastery === 'number'"
					:style="{ flex: `none`, paddingTop: `12px` }"
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
					<AppJolticon
						:style="{ position: `relative`, color: `white`, zIndex: 1 }"
						icon="check"
					/>
					<div
						:style="[
							styleElevate(4),
							{
								position: `absolute`,
								width: `200%`,
								height: `20px`,
								backgroundColor: kThemeGjOverlayNotice,
								transform: `rotate(-45deg)`,
								zIndex: 0,
							},
						]"
					/>
				</div>
			</div>
		</template>
		<template #popover>
			<AppCollectibleThumbDetails :collectible="collectible" />
		</template>
	</AppPopper>
</template>
