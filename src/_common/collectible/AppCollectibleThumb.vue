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
import { Screen } from '~common/screen/screen-service';
import AppStickerMastery from '~common/sticker/AppStickerMastery.vue';
import { kThemeBgOffset, kThemeBiBg, kThemeBiFg, kThemeGjBlue } from '~common/theme/variables';
import { styleTyped } from '~styles/mixins';
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
	if (!Screen.isXs) {
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
			style: styleTyped({
				position: `relative`,
				display: `block`,
				width: `100%`,
				height: `100%`,
				zIndex: hovered ? 1 : undefined,
			}),
		}"
		placement="right-start"
		:fallback-placements="['left-start']"
		@click.capture="onClick"
	>
		<template #default="{ isShowingPopper }">
			<div
				:class="[
					isShowingPopper
						? 'shadow-elevate-xs'
						: hovered
						? 'shadow-elevate-raw-5'
						: 'shadow-elevate-raw-2',
				]"
				:style="{
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
					transform: isShowingPopper
						? `rotate(-4deg) scale(0.95)`
						: hovered
						? `scale(1.1)`
						: undefined,
					zIndex: isShowingPopper ? 2 : undefined,
					transition: `transform 300ms ${kStrongEaseOut}, box-shadow 300ms ${kStrongEaseOut}`,
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
							:style="{
								width: `100%`,
								height: `auto`,
								borderRadius:
									collectible.type === CollectibleType.Background
										? kBorderRadiusBase.px
										: undefined,
							}"
							:src="collectible.image_url"
							alt=""
						/>
					</AppAspectRatio>

					<div>
						<!-- Label -->
						<div
							class="line-clamp-2"
							:style="{
								fontWeight: `bold`,
								userSelect: `none`,
							}"
						>
							{{ collectible.name }}
						</div>
					</div>
				</div>

				<!-- Availability -->
				<div
					v-if="acquisitionStates.hasSale"
					class="rounded-lg"
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
					class="rounded-lg"
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
					class="flex-none pt-[12px]"
				>
					<AppStickerMastery :progress="collectible.sticker_mastery" />
				</div>

				<AppCollectibleUnlockedRibbon v-if="collectible.is_unlocked" />
			</div>
		</template>
		<template #popover>
			<AppCollectibleThumbDetails
				class="w-[250px] p-[16px]"
				:collectible="collectible"
				:feed="feed"
			/>
		</template>
	</AppPopper>
</template>
