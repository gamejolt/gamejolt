<script lang="ts" setup>
import { computed, useId } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import AppCurrencyImg from '~common/currency/AppCurrencyImg.vue';
import { CurrencyType } from '~common/currency/currency-type';
import { formatNumber } from '~common/filters/number';
import {
	isDefaultShopFilters,
	ShopFilterCurrency,
	ShopFilters,
} from '~common/inventory/shop/vending-machine/shop-filters';
import { $gettext, $ngettext } from '~common/translate/translate.service';

type Props = {
	shownCount: number;
	totalCount: number;
};
const { shownCount, totalCount } = defineProps<Props>();

const filters = defineModel<ShopFilters>({ required: true });

const titleId = useId();

const currencyOptions = [
	{ value: 'all', label: $gettext(`All`), currency: undefined },
	{ value: 'joltbux', label: CurrencyType.joltbux.label, currency: CurrencyType.joltbux },
	{ value: 'coins', label: CurrencyType.coins.label, currency: CurrencyType.coins },
] as const satisfies { value: ShopFilterCurrency; label: string; currency: unknown }[];

const countText = computed(() => {
	if (isDefaultShopFilters(filters.value)) {
		return $ngettext(`%{ count } item`, `%{ count } items`, totalCount, {
			count: formatNumber(totalCount),
		});
	}

	return $gettext(`%{ shown } of %{ total }`, {
		shown: formatNumber(shownCount),
		total: formatNumber(totalCount),
	});
});

function setFilter<K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) {
	filters.value = { ...filters.value, [key]: value };
}
</script>

<template>
	<div class="_filters fill-offset" role="group" :aria-labelledby="titleId">
		<div class="_header">
			<h3 :id="titleId" class="_title">
				{{ $gettext(`Filters`) }}
			</h3>

			<div class="_count" role="status">
				{{ countText }}
			</div>
		</div>

		<div class="_controls">
			<div class="_segmented" role="group" :aria-label="$gettext(`Currency`)">
				<AppButton
					v-for="option of currencyOptions"
					:key="option.value"
					class="_button"
					:class="{ _selected: filters.currency === option.value }"
					:solid="filters.currency === option.value"
					:primary="filters.currency === option.value"
					:aria-pressed="filters.currency === option.value"
					:dynamic-slots="option.currency ? ['icon'] : false"
					@click="setFilter('currency', option.value)"
				>
					<template v-if="option.currency" #icon="{ size }">
						<span aria-hidden="true">
							<AppCurrencyImg :currency="option.currency" :max-width="size" />
						</span>
					</template>
					{{ option.label }}
				</AppButton>
			</div>

			<div class="_toggles">
				<AppButton
					class="_button"
					:class="{ _selected: filters.limitedTime }"
					:solid="filters.limitedTime"
					:primary="filters.limitedTime"
					:aria-pressed="filters.limitedTime"
					:icon="filters.limitedTime ? 'check' : undefined"
					@click="setFilter('limitedTime', !filters.limitedTime)"
				>
					{{ $gettext(`Limited time`) }}
				</AppButton>

				<AppButton
					class="_button"
					:class="{ _selected: filters.notOwned }"
					:solid="filters.notOwned"
					:primary="filters.notOwned"
					:aria-pressed="filters.notOwned"
					:icon="filters.notOwned ? 'check' : undefined"
					@click="setFilter('notOwned', !filters.notOwned)"
				>
					{{ $gettext(`Not owned`) }}
				</AppButton>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
._filters
	margin: 0 8px 12px
	padding: 12px
	color: var(--theme-fg)
	rounded-corners-lg()
	elevate-1()

._header
	display: flex
	align-items: baseline
	gap: 12px
	margin-bottom: 12px

// Matches the currency labels in AppVendingMachineCurrencyCard.
._title
	margin: 0
	font-family: $font-family-display
	font-size: $font-size-h2
	font-weight: normal
	line-height: inherit

._controls
	display: flex
	flex-wrap: wrap
	align-items: center
	gap: 8px

._segmented
	display: flex

	._button
		// Collapse the double border between neighbouring buttons.
		&:not(:first-child)
			border-left-width: 0
			border-top-left-radius: 0
			border-bottom-left-radius: 0

		&:not(:last-child)
			border-top-right-radius: 0
			border-bottom-right-radius: 0

// Kept on one line so the two toggles always wrap as a pair.
._toggles
	display: flex
	gap: 8px

._button
	margin: 0 !important
	text-transform: uppercase

	&:not(._selected)
		border-color: var(--theme-bg-subtle)

._count
	margin-left: auto
	color: var(--theme-fg-muted)
	font-size: $font-size-small
</style>
