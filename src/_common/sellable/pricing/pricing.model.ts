import { Model } from '../../model/model.service';

export class SellablePricing extends Model {
	amount!: number;
	currency_code!: string;
	country_code!: string;
	promotional!: boolean;

	// Promotional settings
	start?: number;
	end?: number;
	timezone?: string;

	static getOriginalPricing(pricings: SellablePricing[]) {
		if (Array.isArray(pricings)) {
			if (pricings[0].promotional) {
				return pricings[1];
			}
			return pricings[0];
		}
		return undefined;
	}

	static getPromotionalPricing(pricings: SellablePricing[]) {
		if (Array.isArray(pricings) && pricings[0].promotional) {
			return pricings[0];
		}
		return undefined;
	}
}

Model.create(SellablePricing);
