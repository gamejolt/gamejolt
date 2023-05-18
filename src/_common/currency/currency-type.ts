import { Ref } from 'vue';
import { IllustrationAsset } from '../illustration/AppIllustration.vue';
import { illJoltbux } from '../img/ill/illustrations';
import { imageCoins, imageCoinsSmall, imageGems } from '../img/images';

class CurrencyData {
	public smallAsset: IllustrationAsset | string;

	constructor(
		public readonly id: string,
		public readonly label: string,
		public readonly asset: IllustrationAsset | string,
		smallAsset?: CurrencyData['smallAsset']
	) {
		this.smallAsset = smallAsset || asset;
	}
}

export type Currency = CurrencyData;
export type CurrencyCostData = Record<string, { currency: Currency; amount: number }>;

export const CurrencyType = {
	coins: new CurrencyData('$COIN', 'Coins', imageCoins, imageCoinsSmall),
	gems: new CurrencyData('$GEM', 'Gems', imageGems),
	joltbux: new CurrencyData('$BUX', 'Joltbux', illJoltbux),
} as const;

export function getCurrencyTypeFromIdentifier(id: string): Currency | undefined {
	return Object.values(CurrencyType).find(i => i.id === id);
}

export function canAffordCurrency(
	type: Currency,
	amount: number,
	{ coinBalance, joltbuxBalance }: { coinBalance: Ref<number>; joltbuxBalance: Ref<number> }
) {
	switch (type.id) {
		case CurrencyType.coins.id:
			return coinBalance.value >= amount;
		case CurrencyType.joltbux.id:
			return joltbuxBalance.value >= amount;
	}

	return false;
}
