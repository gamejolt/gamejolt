import { parse } from 'qs';
import { computed, inject, InjectionKey, ref } from 'vue';
import { Api } from '../../_common/api/api.service';
import { GameModel } from '../../_common/game/game.model';
import { GamePackageCardModel } from '../../_common/game/package/card/card.model';
import { GamePackagePayloadModel } from '../../_common/game/package/package-payload.model';
import { GamePackageModel } from '../../_common/game/package/package.model';
import { SellablePricingModel } from '../../_common/sellable/pricing/pricing.model';
import { SellableModel } from '../../_common/sellable/sellable.model';
import { UserModel } from '../../_common/user/user.model';

export class PaymentData {
	method: 'cc-stripe' | 'paypal' = 'cc-stripe';
	email = '';
	amount = 0;
}

export class AddressData {
	country = '';
	region = '';
	street1 = '';
	postcode = '';
}

export const WidgetPackageStoreKey: InjectionKey<WidgetPackageStore> =
	Symbol('widget-package-store');

export type WidgetPackageStore = ReturnType<typeof createWidgetPackageStore>;

export function useWidgetPackageStore() {
	return inject(WidgetPackageStoreKey)!;
}

export function createWidgetPackageStore() {
	const query = parse(window.location.search.substring(1));

	const sellableKey = ref(query.key as string);
	const isLightTheme = ref(query.theme === 'light');
	const isLoaded = ref(false);
	const isProcessing = ref(false);

	const hasInvalidKey = ref(false);
	const hasFailure = ref<string>();

	const game = ref<GameModel>();
	const developer = ref<UserModel>();
	const sellable = ref<SellableModel>();
	const gamePackage = ref<GamePackageModel>();
	const packagePayload = ref<GamePackagePayloadModel>();
	const packageCard = ref<GamePackageCardModel>();
	const addresses = ref<any[]>([]);
	const minOrderAmount = ref(50);
	const pricing = ref<SellablePricingModel>();
	const originalPricing = ref<SellablePricingModel>();

	const payment = ref(new PaymentData());
	const address = ref(new AddressData());

	const price = computed(() => pricing.value && (pricing.value.amount || minOrderAmount.value));
	const originalPrice = computed(() => originalPricing.value?.amount);

	async function bootstrap() {
		try {
			const payload = await Api.sendRequest(`/widgets/package/${sellableKey.value}`);

			game.value = new GameModel(payload.game);
			developer.value = new UserModel(game.value.developer);
			sellable.value = new SellableModel(payload.sellable);
			packagePayload.value = new GamePackagePayloadModel(payload);
			packageCard.value = new GamePackageCardModel(
				sellable.value,
				packagePayload.value.releases,
				packagePayload.value.builds
			);
			gamePackage.value = packagePayload.value.packages[0];

			addresses.value = payload.billingAddresses || [];
			minOrderAmount.value = payload.minOrderAmount || 50;

			if (sellable.value.pricings.length) {
				pricing.value = sellable.value.pricings[0];
				if (pricing.value.promotional) {
					originalPricing.value = sellable.value.pricings[1];
				}
			}

			isLoaded.value = true;
		} catch (_e) {
			console.error(_e);
			hasInvalidKey.value = true;
		}
	}

	async function checkout() {
		if (isProcessing.value) {
			return;
		}

		isProcessing.value = true;

		const data: any = {
			payment_method: payment.value.method,
			pricing_id: pricing.value!.id,
			sellable_id: sellable.value!.id,
			email_address: payment.value.email,
			amount: payment.value.amount * 100,
			source: document.referrer,
		};

		if (addresses.value.length) {
			data.address_id = addresses.value[0].id;
		}

		try {
			const response = await Api.sendRequest(`/web/checkout/setup-order`, data);

			if (typeof response.success !== 'undefined' && !response.success) {
				throw new Error('Response returned errors.');
			}

			window.parent.location.href = response.redirectUrl;
		} catch (_e) {
			hasFailure.value = 'setup-order';
			isProcessing.value = false;
		}
	}

	return {
		sellableKey,
		isLightTheme,
		isLoaded,
		isProcessing,
		hasInvalidKey,
		hasFailure,
		game,
		developer,
		sellable,
		gamePackage,
		packagePayload,
		packageCard,
		addresses,
		minOrderAmount,
		pricing,
		originalPricing,
		payment,
		address,
		price,
		originalPrice,

		bootstrap,
		checkout,
	};
}
