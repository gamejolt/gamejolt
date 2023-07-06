import { Ref } from 'vue';
import { IllustrationAsset } from '../illustration/AppIllustration.vue';
import { illJoltbux } from '../img/ill/illustrations';
import { imageCoins, imageCoinsSmall, imageGems } from '../img/images';

class CurrencyData {
	public smallAsset: IllustrationAsset | string;

	constructor(
		public readonly id: '$COIN' | '$GEM' | '$BUX',
		public readonly label: string,
		public readonly asset: IllustrationAsset | string,
		smallAsset?: CurrencyData['smallAsset']
	) {
		this.smallAsset = smallAsset || asset;
	}
}

export type Currency = CurrencyData;
export type CurrencyCostData = Partial<
	Record<CurrencyData['id'], [currency: Currency, amount: number]>
>;

export const CurrencyType = {
	coins: new CurrencyData('$COIN', 'Coins', imageCoins, imageCoinsSmall),
	gems: new CurrencyData('$GEM', 'Gems', imageGems),
	joltbux: new CurrencyData('$BUX', 'Joltbux', illJoltbux),
} as const;

export function getCurrencyTypeFromIdentifier(id: string): Currency | undefined {
	return Object.values(CurrencyType).find(i => i.id === id);
}

export function canAffordCurrency(
	currencyId: CurrencyData['id'],
	amount: number,
	{ coinBalance, joltbuxBalance }: { coinBalance: Ref<number>; joltbuxBalance: Ref<number> }
) {
	switch (currencyId) {
		case CurrencyType.coins.id:
			return coinBalance.value >= amount;
		case CurrencyType.joltbux.id:
			return joltbuxBalance.value >= amount;
		case CurrencyType.gems.id:
			return false;
		default:
			console.warn('Unexpected [currencyId] value', currencyId);
	}

	return false;
}
