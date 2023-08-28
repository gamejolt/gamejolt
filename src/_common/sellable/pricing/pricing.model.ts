import { Model } from '../../model/model.service';

export class SellablePricingModel extends Model {
	declare amount: number;
	declare currency_code: string;
	declare country_code: string;
	declare promotional: boolean;

	// Promotional settings
	declare start?: number;
	declare end?: number;
	declare timezone?: string;
}

export function getOriginalSellablePricing(pricings: SellablePricingModel[]) {
	if (Array.isArray(pricings) && pricings.length > 0) {
		if (pricings[0].promotional) {
			return pricings[1];
		}
		return pricings[0];
	}
	return undefined;
}

export function getPromotionalSellablePricing(pricings: SellablePricingModel[]) {
	if (Array.isArray(pricings) && pricings.length > 0 && pricings[0].promotional) {
		return pricings[0];
	}
	return undefined;
}
