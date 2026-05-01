<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppCollectibleThumbDetails from '~common/collectible/AppCollectibleThumbDetails.vue';
import AppCollectibleUnlockedRibbon from '~common/collectible/AppCollectibleUnlockedRibbon.vue';
import { CollectibleModel, CollectibleType } from '~common/collectible/collectible.model';
import { showCollectibleDetailsModal } from '~common/collectible/details-modal/modal.service';
import { JoltydexFeed } from '~common/joltydex/joltydex-feed';
import { useOnHover } from '~common/on/useOnHover';
import AppPopper from '~common/popper/AppPopper.vue';
import { getScreen } from '~common/screen/screen-service';
import AppStickerMastery from '~common/sticker/AppStickerMastery.vue';
import { kThemeBgOffset, kThemeBiBg, kThemeBiFg, kThemeGjBlue } from '~common/theme/variables';
import {
	styleBorderRadiusLg,
	styleElevate,
	styleLineClamp,
	styleTyped,
	styleWhen,
} from '~styles/mixins';
import {
	kBorderRadiusBase,
	kBorderRadiusLg,
	kFontSizeTiny,
	kStrongEaseOut,
} from '~styles/variables';

type Props = {
	collectible: CollectibleModel;
	feed: JoltydexFeed;
};
const { collectible, feed } = defineProps<Props>();
const { hoverBinding, hovered } = useOnHover();

function onClick(e: MouseEvent) {
	if (!getScreen().isXs.value) {
		return;
	}

	showCollectibleDetailsModal({ collectible, feed });
	e.stopImmediatePropagation();
}

const acquisitionStates = computed(() => {
	let hasSale = false;
	let hasChargeReward = false;

	for (const i of collectible.acquisition) {
		// Anything with a sale id is sellable.
		if (i.sale_id) {
			hasSale = true;
		}

		if (i.sticker_pack_id) {
			// Premium sticker packs are always sellable. If it's not premium,
			// then it's considered sellable only if it isn't a charge reward
			// pack.
			if (i.sticker_pack_is_premium || !i.sticker_pack_is_charge_reward) {
				hasSale = true;
			}
			if (i.sticker_pack_is_charge_reward) {
				hasChargeReward = true;
			}
		}

		if (hasSale && hasChargeReward) {
			break;
		}
	}

	return { hasSale, hasChargeReward };
});

const availabilityTagStyles = {
	...styleBorderRadiusLg,
	marginTop: `4px`,
	padding: `2px 8px`,
	display: `inline-block`,
	fontSize: kFontSizeTiny.px,
	fontWeight: `bold`,
	alignSelf: `center`,
} satisfies CSSProperties;
</script>

<template>
	<AppPopper
		v-bind="{
			...hoverBinding,
			style: styleTyped([
				{
					position: `relative`,
					display: `block`,
					width: `100%`,
					height: `100%`,
				},
				styleWhen(hovered, {
					zIndex: 1,
				}),
			]),
		}"
		placement="right-start"
		:fallback-placements="['left-start']"
		@click.capture="onClick"
	>
		<template #default="{ isShowingPopper }">
			<div
				:style="[
					styleElevate(2),
					{
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

					<div>
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
				</div>

				<!-- Availability -->
				<div
					v-if="acquisitionStates.hasSale"
					:style="[
						availabilityTagStyles,
						{
							backgroundColor: kThemeBiBg,
							color: kThemeBiFg,
						},
					]"
				>
					{{ $gettext(`Available in shop`) }}
				</div>

				<div
					v-if="acquisitionStates.hasChargeReward"
					:style="[
						availabilityTagStyles,
						{
							backgroundColor: kThemeGjBlue,
							color: `black`,
						},
					]"
				>
					{{ $gettext(`Charge reward`) }}
				</div>
				<div
					v-if="typeof collectible.sticker_mastery === 'number'"
					:style="{ flex: `none`, paddingTop: `12px` }"
				>
					<AppStickerMastery :progress="collectible.sticker_mastery" />
				</div>

				<AppCollectibleUnlockedRibbon v-if="collectible.is_unlocked" />
			</div>
		</template>
		<template #popover>
			<AppCollectibleThumbDetails
				:collectible="collectible"
				:feed="feed"
				:style="{
					width: `250px`,
					padding: `16px`,
				}"
			/>
		</template>
	</AppPopper>
</template>
