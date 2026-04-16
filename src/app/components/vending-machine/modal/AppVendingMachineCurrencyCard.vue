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
import {
	kElevateTransition,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleWhen,
} from '~styles/mixins';
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
		v-bind="{
			...hoverBinding,
			style: [
				styleBorderRadiusLg,
				{
					backgroundColor: kThemeBgOffset,
					gap: `8px`,
					color: kThemeFg,
					padding: `${12 - kBorderWidthBase.value}px`,
					borderWidth: kBorderWidthBase.px,
					borderStyle: `solid`,
					borderColor: `transparent`,
				},
				styleElevate(1),
				styleWhen(hovered, {
					...styleElevate(2),
					borderColor: kThemePrimary,
					backgroundColor: kThemeBgBackdrop,
				}),
				// Needs to be defined after [styleElevate] calls.
				{
					transition: `background-color 200ms ${kStrongEaseOut}, border-color 250ms ${kStrongEaseOut}, ${kElevateTransition}`,
				},
			],
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
			<div
				:style="{
					flexDirection: `column`,
					justifyContent: `center`,
				}"
			>
				<div
					:style="{
						fontFamily: kFontFamilyDisplay,
						fontSize: labelFontSize.px,
					}"
				>
					{{ currency.label }}
				</div>
				<div
					:style="{
						fontSize: amountFontSize.px,
						fontWeight: `600`,
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
					...styleFlexCenter(),
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

		<AppButton
			block
			solid
			:force-hover="hovered"
			:style="{
				pointerEvents: `none`,
			}"
		>
			{{
				$gettext(`Get %{ label }`, {
					label: currency.label,
				})
			}}
		</AppButton>
	</a>
</template>
