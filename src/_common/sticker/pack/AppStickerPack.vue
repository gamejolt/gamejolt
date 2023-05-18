<script lang="ts">
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppCurrencyPillList from '../../currency/AppCurrencyPillList.vue';
import { CurrencyCostData, CurrencyType } from '../../currency/currency-type';
import { shorthandReadableTime } from '../../filters/duration';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { InventoryShopProductSalePricing } from '../../inventory/shop/inventory-shop-product-sale-pricing.model';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppPopperConfirmWrapper from '../../popper/confirm-wrapper/AppPopperConfirmWrapper.vue';
import { StickerPack } from './pack.model';

export const StickerPackRatio = 2 / 3;
</script>

<script lang="ts" setup>
interface StickerPackDetails {
	name?: boolean;
	cost?: boolean;
}

type PackDetailsOptions = boolean | StickerPackDetails;

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPack>,
		required: true,
	},
	showDetails: {
		type: [Object, Boolean] as PropType<PackDetailsOptions>,
		default: false,
	},
	canClickPack: {
		type: Boolean,
	},
	forceElevate: {
		type: Boolean,
	},
	hoverTitle: {
		type: String,
		default: undefined,
	},
	expiryInfo: {
		type: Number,
		default: undefined,
	},
	costOverride: {
		type: Array as PropType<InventoryShopProductSalePricing[]>,
		default: undefined,
	},
});

const emit = defineEmits({
	clickPack: (_currencyOptions: CurrencyCostData) => true,
});

const { pack, showDetails, canClickPack, forceElevate, hoverTitle, expiryInfo, costOverride } =
	toRefs(props);

const showName = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.name === true;
});

const showCost = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.cost === true;
});

const currencyOptions = computed(() => {
	const result: CurrencyCostData = {};

	if (costOverride?.value) {
		for (const pricing of costOverride.value) {
			const currency = pricing.knownCurrencyType;
			if (currency) {
				result[currency.id] = { currency, amount: pricing.price };
			}
		}
	} else {
		const currency = CurrencyType.coins;
		result[currency.id] = { currency, amount: pack.value.cost_coins };
	}

	return result;
});

function onClickPack() {
	if (canClickPack.value) {
		emit('clickPack', currencyOptions.value);
	}
}

const overlayedStyle: CSSProperties = {
	...styleChangeBgRgba(`0, 0, 0`, 0.54),
	...styleBorderRadiusLg,
	position: `absolute`,
	padding: `2px 6px`,
	color: `white`,
	fontWeight: 700,
};
</script>

<template>
	<!-- AppStickerPack -->
	<div>
		<div :style="{ position: `relative` }">
			<AppAspectRatio :ratio="StickerPackRatio" show-overflow>
				<AppPopperConfirmWrapper
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:overlay-radius="12"
					:disabled="!canClickPack"
					:initial-text="hoverTitle"
					@confirm="onClickPack()"
				>
					<AppMediaItemBackdrop
						:style="{
							...styleWhen(forceElevate, styleElevate(1)),
							...styleWhen(canClickPack, {
								cursor: `pointer`,
							}),
						}"
						:media-item="pack.media_item"
						radius="lg"
					>
						<AppImgResponsive
							:src="pack.media_item.mediaserver_url"
							alt=""
							:style="{
								width: `100%`,
								height: `100%`,
								objectFit: `cover`,
							}"
							draggable="false"
							ondragstart="return false"
						/>
					</AppMediaItemBackdrop>

					<slot name="overlay" />
				</AppPopperConfirmWrapper>
			</AppAspectRatio>

			<div
				v-if="showCost"
				:style="{
					position: `absolute`,
					bottom: '4px',
					right: '4px',
				}"
			>
				<AppCurrencyPillList
					:currencies="currencyOptions"
					direction="column"
					cross-align="flex-end"
					:gap="4"
					overlay
				/>
			</div>

			<div
				v-if="expiryInfo"
				:style="{
					...overlayedStyle,
					right: `4px`,
					top: `4px`,
				}"
			>
				{{
					shorthandReadableTime(expiryInfo, {
						allowFuture: true,
						precision: 'rough',
						nowText: $gettext(`Expired`),
					})
				}}
			</div>
		</div>

		<div
			v-if="showName"
			:style="{
				marginTop: `8px`,
				fontWeight: 700,
			}"
		>
			{{ pack.name }}
		</div>
	</div>
</template>
