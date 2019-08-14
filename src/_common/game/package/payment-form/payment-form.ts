import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { arrayIndexBy } from '../../../../utils/array';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import { currency } from '../../../../vue/filters/currency';
import { AppStore } from '../../../../vue/services/app/app-store';
import { Api } from '../../../api/api.service';
import { Device } from '../../../device/device.service';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/expand.vue';
import { AppFocusWhen } from '../../../form-vue/focus-when.directive';
import AppForm from '../../../form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../form-vue/form.service';
import { Geo, Region } from '../../../geo/geo.service';
import { Growls } from '../../../growls/growls.service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import AppLoadingFade from '../../../loading/fade/fade.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { OrderPayment } from '../../../order/payment/payment.model';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { Sellable } from '../../../sellable/sellable.model';
import { AppTooltip } from '../../../tooltip/tooltip';
import { User } from '../../../user/user.model';
import { GameBuild } from '../../build/build.model';
import { Game } from '../../game.model';
import { GamePackage } from '../package.model';

type CheckoutType = 'cc-stripe' | 'paypal' | 'wallet';

@Component({
	components: {
		AppLoading,
		AppLoadingFade,
		AppExpand,
		AppPopper,
	},
	directives: {
		AppTooltip,
		AppFocusWhen,
	},
	filters: {
		currency,
	},
})
export default class FormGamePackagePayment extends BaseForm<any>
	implements FormOnInit, FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError {
	@Prop(Game)
	game!: Game;
	@Prop(GamePackage)
	package!: GamePackage;
	@Prop(GameBuild)
	build?: GameBuild;
	@Prop(Sellable)
	sellable!: Sellable;
	@Prop(String)
	partnerKey?: string;
	@Prop(User)
	partner?: User;
	@Prop(String)
	operation!: 'download' | 'play';

	@State
	app!: AppStore;

	$refs!: {
		form: AppForm;
	};

	warnOnDiscard = false;

	isLoaded = false;
	isLoadingMethods = true;
	isProcessing = false;
	checkoutType: CheckoutType = 'cc-stripe';
	checkoutStep = 'primary';

	cards: any[] = [];
	cardsTax = {};
	addresses: any[] = [];
	calculatedAddressTax = false;
	addressTaxAmount = 0;
	countries = Geo.getCountries();
	regions: Region[] | null = null;
	walletBalance = 0;
	walletTax = 0;
	minOrderAmount = 50;

	readonly Screen = Screen;

	get pricing() {
		return this.sellable.pricings[0];
	}

	get _minOrderAmount() {
		return this.sellable.type === 'paid'
			? this.pricing.amount / 100
			: this.minOrderAmount / 100;
	}

	get formattedAmount() {
		return currency(this.pricing.amount);
	}

	get minOrderMessage() {
		return this.$gettextInterpolate(
			// tslint:disable-next-line:max-line-length
			`Because of payment processing fees, we are not able to sell this game for less than %{ amount }. You can click the link below to grab the download for free, though!`,
			{ amount: currency(this.minOrderAmount) }
		);
	}

	get hasSufficientWalletFunds() {
		if (!this.formModel.amount || this.formModel.amount <= 0) {
			return true;
		}

		// When we're filling in the address, pull that tax.
		// Otherwise, when we're on the main page, check the wallet tax amount for their saved address.
		const taxAmount = this.checkoutStep === 'address' ? this.addressTaxAmount : this.walletTax;
		const sellableAmount = this.pricing.amount;
		const currentAmount = this.formModel.amount * 100; // The formModel amount is a decimal.

		// Paid games have to be more than the amount of the game base price.
		if (
			this.sellable.type === Sellable.TYPE_PAID &&
			this.walletBalance < sellableAmount + taxAmount
		) {
			return false;
		}

		// All games have to be more than they've entered into the box.
		if (this.walletBalance < currentAmount + taxAmount) {
			return false;
		}

		return true;
	}

	onInit() {
		this.setField('amount', this.pricing.amount ? this.pricing.amount / 100 : null);
		this.setField('country', 'us');
		this.load();
	}

	@Watch('formModel.country')
	onCountryChange() {
		this.regions = Geo.getRegions(this.formModel.country) || null;
		if (this.regions) {
			this.setField('region', this.regions[0].code); // Default to first.
		} else {
			this.setField('region', '');
		}
		this.getAddressTax();
	}

	@Watch('formModel.region')
	onTaxFieldsChange() {
		this.getAddressTax();
	}

	@Watch('formModel.amount')
	onAmountChange() {
		this.isLoadingMethods = true;
		this.load();
	}

	async load() {
		const response = await Api.sendRequest(
			'/web/checkout/methods?amount=' + this.formModel.amount * 100,
			null,
			{ detach: true }
		);

		this.isLoadingMethods = false;
		this.isLoaded = true;
		this.minOrderAmount = response.minOrderAmount || 50;

		if (response && response.cards && response.cards.length) {
			this.cards = response.cards;
			this.cardsTax = arrayIndexBy<any>(response.cardsTax, 'id');
		}

		if (response && response.billingAddresses && response.billingAddresses.length) {
			this.addresses = response.billingAddresses;
		}

		if (response && response.walletBalance && response.walletBalance > 0) {
			this.walletBalance = response.walletBalance;
			this.walletTax = response.walletTax;
		}
	}

	addMoney(amount: number) {
		let curAmount: number =
			typeof this.formModel.amount === 'string'
				? parseFloat(this.formModel.amount)
				: this.formModel.amount;

		if (!curAmount) {
			curAmount = amount;
		} else {
			curAmount += amount;
			curAmount = parseFloat(curAmount.toFixed(2));
		}
		this.setField('amount', curAmount);
	}

	collectAddress(checkoutType: CheckoutType) {
		if (this.addresses.length) {
			if (checkoutType === 'paypal') {
				this.checkoutPaypal();
				return;
			} else if (checkoutType === 'wallet') {
				this.checkoutWallet();
				return;
			}
		}

		this.checkoutStep = 'address';
		this.checkoutType = checkoutType;
		this.calculatedAddressTax = false;
		this.addressTaxAmount = 0;
	}

	async getAddressTax() {
		this.calculatedAddressTax = false;
		if (!this.formModel.country || !this.formModel.region) {
			return;
		}

		const data = {
			amount: this.formModel.amount * 100,
			country: this.formModel.country,
			region: this.formModel.region,
		};

		const response = await Api.sendRequest('/web/checkout/taxes', data, {
			detach: true,
		});

		this.calculatedAddressTax = true;
		this.addressTaxAmount = response.amount;
	}

	checkoutCard() {
		this.checkoutType = 'cc-stripe';
	}

	checkoutPaypal() {
		this.checkoutType = 'paypal';
	}

	startOver() {
		this.checkoutStep = 'primary';
	}

	checkoutSavedCard(card: any) {
		const data: any = {
			payment_method: 'cc-stripe',
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,
		};

		return this.doCheckout(data, { payment_source: card.id });
	}

	checkoutWallet() {
		const data: any = {
			payment_method: 'wallet',
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,
		};

		if (this.addresses.length) {
			data.address_id = this.addresses[0].id;
		} else {
			data.country = this.formModel.country;
			data.street1 = this.formModel.street1;
			data.region = this.formModel.region;
			data.postcode = this.formModel.postcode;
		}

		return this.doCheckout(data, { wallet: true });
	}

	/**
	 * This is for checkouts outside the normal form submit flow.
	 * We need to manually handle processing and errors.
	 */
	private async doCheckout(setupData: any, chargeData: any) {
		if (this.isLoadingMethods || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		setupData['source'] = HistoryTick.getSource('Game', this.package.game_id) || null;
		setupData['os'] = Device.os();
		setupData['arch'] = Device.arch();
		setupData['ref'] = this.partnerKey || null;

		try {
			let response = await Api.sendRequest('/web/checkout/setup-order', setupData, {
				detach: true,
			});

			if (response.success === false) {
				throw response;
			}

			response = await Api.sendRequest(
				'/web/checkout/charge/' + response.cart.id,
				chargeData,
				{
					detach: true,
				}
			);

			if (response.success === false) {
				throw response;
			}

			// Notify that we've bought this package.
			this.$emit('bought');
		} catch (_e) {
			this.isProcessing = false;

			// This should always succeed, so let's throw a generic message if it fails.
			Growls.error({
				sticky: true,
				message: this.$gettext('There was a problem processing your payment method.'),
			});
		}
	}

	onSubmit() {
		this.isProcessing = true;

		const data: any = {
			payment_method: this.checkoutType,
			sellable_id: this.sellable.id,
			pricing_id: this.pricing.id,
			amount: this.formModel.amount * 100,

			country: this.formModel.country,
			street1: this.formModel.street1,
			region: this.formModel.region,
			postcode: this.formModel.postcode,
		};

		if (!this.app.user) {
			data.email_address = this.formModel.email_address;
		}

		if (this.addresses.length) {
			data.address_id = this.addresses[0].id;
		}

		data['source'] = HistoryTick.getSource('Game', this.package.game_id) || null;
		data['os'] = Device.os();
		data['arch'] = Device.arch();
		data['ref'] = this.partnerKey || null;

		return Api.sendRequest('/web/checkout/setup-order', data, { detach: true });
	}

	onSubmitSuccess(response: any) {
		if (GJ_IS_CLIENT) {
			// Our checkout can be done in client.
			if (this.checkoutType === OrderPayment.METHOD_CC_STRIPE) {
				Navigate.goto(Environment.checkoutBaseUrl + '/checkout/' + response.cart.id);
			} else {
				// Otherwise we have to open in browser.
				Navigate.gotoExternal(response.redirectUrl);
			}
		} else {
			// For site we have to replace the URL completely since we are switching to https.
			Navigate.goto(response.redirectUrl);
		}
	}

	onSubmitError() {
		this.isProcessing = false;
	}
}
