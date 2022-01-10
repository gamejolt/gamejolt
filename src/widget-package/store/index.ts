import { parse } from 'querystring';
import { reactive } from 'vue';
import { buildUseStore, VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Api } from '../../_common/api/api.service';
import { Game } from '../../_common/game/game.model';
import { GamePackageCardModel } from '../../_common/game/package/card/card.model';
import { GamePackagePayloadModel } from '../../_common/game/package/package-payload.model';
import { GamePackage } from '../../_common/game/package/package.model';
import { SellablePricing } from '../../_common/sellable/pricing/pricing.model';
import { Sellable } from '../../_common/sellable/sellable.model';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../_common/store/app-store';
import { ThemeActions, ThemeMutations, ThemeStore } from '../../_common/theme/theme.store';
import { User } from '../../_common/user/user.model';

export type Actions = AppActions &
	ThemeActions & {
		bootstrap: undefined;
		checkout: undefined;
	};

export type Mutations = AppMutations &
	ThemeMutations & {
		setInvalidKey: undefined;
		setFailure: undefined;
		clearFailure: undefined;
		setProcessing: undefined;
		setNotProcessing: undefined;
		_bootstrap: any;
		setPayment: any;
		setAddress: any;
	};

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

@VuexModule({
	store: true,
	modules: {
		app: appStore,
		theme: new ThemeStore(),
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;
	theme!: ThemeStore;

	sellableKey = parse(window.location.search.substring(1)).key as string;
	isLightTheme = parse(window.location.search.substring(1)).theme === 'light';
	isLoaded = false;
	isProcessing = false;
	view: 'AppDownload' | 'AppPayment' = 'AppDownload';

	hasInvalidKey = false;
	hasFailure?: string = undefined;

	game: Game = null as any;
	developer: User = null as any;
	sellable: Sellable = null as any;
	package: GamePackage = null as any;
	packagePayload: GamePackagePayloadModel = null as any;
	packageCard: GamePackageCardModel = null as any;
	addresses: any[] = [];
	minOrderAmount = 50;
	pricing: SellablePricing | null = null;
	originalPricing: SellablePricing | null = null;

	payment = new PaymentData();
	address = new AddressData();

	get price() {
		return this.pricing && (this.pricing.amount || this.minOrderAmount);
	}

	get originalPrice() {
		return this.originalPricing && this.originalPricing.amount;
	}

	@VuexMutation
	setInvalidKey() {
		this.hasInvalidKey = true;
	}

	@VuexMutation
	setFailure(failure?: string) {
		this.hasFailure = failure;
	}

	@VuexMutation
	clearFailure() {
		this.hasFailure = undefined;
	}

	@VuexMutation
	setProcessing() {
		this.isProcessing = true;
	}

	@VuexMutation
	setNotProcessing() {
		this.isProcessing = false;
	}

	@VuexMutation
	_bootstrap(response: any) {
		this.game = new Game(response.game);
		this.developer = new User(this.game.developer);
		this.sellable = new Sellable(response.sellable);
		this.packagePayload = new GamePackagePayloadModel(response);
		this.packageCard = new GamePackageCardModel(
			this.sellable,
			this.packagePayload.releases,
			this.packagePayload.builds
		);
		this.package = this.packagePayload.packages[0];

		this.addresses = response.billingAddresses || [];
		this.minOrderAmount = response.minOrderAmount || 50;

		if (this.sellable.pricings.length) {
			this.pricing = this.sellable.pricings[0];
			if (this.pricing.promotional) {
				this.originalPricing = this.sellable.pricings[1];
			}
		}

		if (this.sellable.type === Sellable.TYPE_PAID && !this.sellable.is_owned) {
			this.view = 'AppPayment';
		}

		this.isLoaded = true;
	}

	@VuexMutation
	setPayment(payment: any) {
		this.payment = payment;
	}

	@VuexMutation
	setAddress(address: any) {
		this.address = address;
	}

	@VuexAction
	async bootstrap() {
		try {
			const response = await Api.sendRequest(`/widgets/package/${this.sellableKey}`);
			this._bootstrap(response);
		} catch (_e) {
			console.error(_e);
			this.setInvalidKey();
		}
	}

	@VuexAction
	async checkout() {
		if (this.isProcessing) {
			return;
		}

		this.setProcessing();

		const data: any = {
			payment_method: this.payment.method,
			pricing_id: this.pricing!.id,
			sellable_id: this.sellable.id,
			email_address: this.payment.email,
			amount: this.payment.amount * 100,
			source: document.referrer,
		};

		if (this.addresses.length) {
			data.address_id = this.addresses[0].id;
		}

		try {
			const response = await Api.sendRequest(`/web/checkout/setup-order`, data);

			if (typeof response.success !== 'undefined' && !response.success) {
				throw new Error('Response returned errors.');
			}

			window.parent.location.href = response.redirectUrl;
		} catch (_e) {
			this.setFailure('setup-order');
			this.setNotProcessing();
		}
	}
}

export const store = reactive(new Store()) as Store;
export const useStore = buildUseStore<Store>();
