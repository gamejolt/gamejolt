<script lang="ts" setup>
import { CSSProperties } from 'vue';

import { showGetCoinsRedirectModal } from '~app/components/vending-machine/modal/_get-coins-redirect-modal/modal.service';
import { trackShopView } from '~common/analytics/analytics.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import AppCurrencyImg from '~common/currency/AppCurrencyImg.vue';
import { Currency, CurrencyType } from '~common/currency/currency-type';
import { formatNumber } from '~common/filters/number';
import { showPurchaseMicrotransactionModal } from '~common/microtransaction/purchase-modal/modal.service';
import { useModal } from '~common/modal/modal.service';
import { useOnHover } from '~common/on/useOnHover';
import { useCommonStore } from '~common/store/common-store';
import {
	kThemeBgBackdrop,
	kThemeBgOffset,
	kThemeFg,
	kThemeFg10,
	kThemePrimary,
} from '~common/theme/variables';
import { kElevateTransition } from '~styles/mixins';
import {
	kBorderWidthBase,
	kFontFamilyDisplay,
	kFontSizeBase,
	kFontSizeH2,
	kLineHeightBase,
	kStrongEaseOut,
} from '~styles/variables';

type Props = {
	currency: Currency;
	amount: number;
};
const { currency, amount } = defineProps<Props>();

const modal = useModal();
const { user: authUser } = useCommonStore();
const { hoverBinding, hovered } = useOnHover();

async function onClickCard(currency: Currency) {
	// Only authed users can interact with these.
	if (!authUser.value) {
		return;
	}

	if (currency.id === CurrencyType.joltbux.id) {
		trackShopView({ type: 'joltbux-card' });
		showPurchaseMicrotransactionModal();
	} else if (currency.id === CurrencyType.coins.id) {
		trackShopView({ type: 'coins-card' });
		const isRedirecting = await showGetCoinsRedirectModal();

		// Dismiss the parent modal if we found one.
		if (isRedirecting) {
			modal?.dismiss();
		}
	} else {
		console.error('Unknown currency type', currency);
	}
}

const currencyCardImgStyles: CSSProperties = {
	objectFit: `contain`,
	width: `100%`,
	height: `100%`,
};

const labelFontSize = kFontSizeH2;
const amountFontSize = kFontSizeBase;
const imageSize = Math.floor((labelFontSize.value + amountFontSize.value) * kLineHeightBase);
</script>

<template>
	<a
		v-app-auth-required
		:class="[
			'rounded-lg elevate-transition',
			hovered ? 'shadow-elevate-raw-2' : 'shadow-elevate-xs',
		]"
		v-bind="{
			...hoverBinding,
			style: {
				backgroundColor: hovered ? kThemeBgBackdrop : kThemeBgOffset,
				gap: `8px`,
				color: kThemeFg,
				padding: `${12 - kBorderWidthBase.value}px`,
				borderWidth: kBorderWidthBase.px,
				borderStyle: `solid`,
				borderColor: hovered ? kThemePrimary : `transparent`,
				transition: `background-color 200ms ${kStrongEaseOut}, border-color 250ms ${kStrongEaseOut}, ${kElevateTransition}`,
			},
		}"
		@click="onClickCard(currency)"
	>
		<div
			:style="{
				display: `grid`,
				gridTemplateColumns: `minmax(0, 1fr) ${imageSize}px`,
				gap: `16px`,
				justifyContent: `space-between`,
				marginBottom: `12px`,
			}"
		>
			<!-- Label and Amount -->
			<div class="flex-col justify-center">
				<div
					:style="{
						fontFamily: kFontFamilyDisplay,
						fontSize: labelFontSize.px,
					}"
				>
					{{ currency.label }}
				</div>
				<div
					class="font-semibold"
					:style="{
						fontSize: amountFontSize.px,
					}"
				>
					{{ formatNumber(amount) }}
				</div>
			</div>

			<!-- Image -->
			<AppAspectRatio
				:ratio="1"
				:style="{
					backgroundColor: kThemeFg10,
					borderRadius: `50%`,
				}"
				:inner-styles="{
					display: `flex`,
					alignItems: `center`,
					justifyContent: `center`,
					padding: `8px`,
				}"
				show-overflow
			>
				<AppCurrencyImg
					asset-size="large"
					:currency="currency"
					:max-width="0"
					:style="currencyCardImgStyles"
					:ill-styles="currencyCardImgStyles"
				/>
			</AppAspectRatio>
		</div>

		<AppButton class="pointer-events-none" block solid :force-hover="hovered">
			{{
				$gettext(`Get %{ label }`, {
					label: currency.label,
				})
			}}
		</AppButton>
	</a>
</template>
