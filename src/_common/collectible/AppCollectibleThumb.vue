<script lang="ts" setup>
import { PropType } from 'vue';
import { styleElevate, styleFlexCenter, styleLineClamp, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kBorderRadiusLg, kStrongEaseOut } from '../../_styles/variables';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppOnHover from '../on/AppOnHover.vue';
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
	<AppOnHover v-slot="{ hoverBinding, hovered }">
		<AppPopper
			v-bind="{
				...hoverBinding,
				style: {
					display: `block`,
					width: `100%`,
					height: `100%`,
				},
			}"
			placement="right-start"
			:fallback-placements="['left-start']"
		>
			<template #default="{ isShowingPopper }">
				<div
					:style="[
						{
							...styleElevate(2),
							position: `relative`,
							padding: `8px`,
							height: `100%`,
							backgroundColor: kThemeBgOffset,
							borderRadius: kBorderRadiusLg.px,
							textAlign: `center`,
							overflow: `hidden`,
							display: `flex`,
							cursor: `pointer`,
							flexDirection: `column`,
						},
						// We make it look like the card pulls up.
						styleWhen(hovered, {
							...styleElevate(5),
							transform: `scale(1.1)`,
							zIndex: 2,
						}),
						// When viewing details we push the card back since the details
						// popover should be the main view.
						styleWhen(isShowingPopper, {
							...styleElevate(1),
							transform: `rotate(-4deg) scale(0.95)`,
							zIndex: 2,
						}),
						{
							// Put this last so that it overrides any of the box-shadow
							// transitions from elevation changes.
							transition: `transform 300ms ${kStrongEaseOut}, box-shadow 300ms ${kStrongEaseOut}`,
						},
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
	</AppOnHover>
</template>
