import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./payment.html?style=./payment.styl';

import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Geo, Region } from '../../../../lib/gj-lib-client/components/geo/geo.service';
import { Order } from '../../../../lib/gj-lib-client/components/order/order.model';
import { FormOnSubmit } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppFocusWhen } from '../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';

@View
@Component({
	components: {
		AppExpand,
		AppLoading,
		AppJolticon,
	},
	directives: {
		AppTooltip,
		AppFocusWhen,
	},
	filters: {
		currency,
	},
})
export class FormPayment extends BaseForm<any> implements FormOnInit, FormOnSubmit {
	@State app: AppStore;

	@Prop(Array) cards: any[];
	@Prop(Order) order: Order;

	warnOnDiscard = false;

	stripeError: string | null = null;
	countries = Geo.getCountries();
	regions: Region[] | null = null;
	calculatedTax = false;
	taxAmount = 0;

	ccMask = [
		/\d/,
		/\d/,
		/\d/,
		/\d/,
		' ',
		/\d/,
		/\d/,
		/\d/,
		/\d/,
		' ',
		/\d/,
		/\d/,
		/\d/,
		/\d/,
		' ',
		/\d/,
		/\d/,
		/\d/,
		/\d/,
	];
	expMask = [/\d/, /\d/, '/', /\d/, /\d/];

	onInit() {
		this.setField('country', 'us');
		this.setField('selectedCard', 0);
		if (this.cards && this.cards.length) {
			this.setField('selectedCard', this.cards[0].id);
		}

		this.setField('save_card', true);

		if (GJ_ENVIRONMENT === 'development') {
			this.setField('fullname', 'Vash the Stampede');
			this.setField('card_number', '4242424242424242');
			this.setField('exp', '1216');
			this.setField('cvc', '123');
			this.setField('street1', `No-man's Land`);
			this.setField('postcode', '11111');
			this.setField('save_card', false);
		}

		this.getTax();
	}

	@Watch('formModel.country')
	onCountryChange() {
		this.regions = Geo.getRegions(this.formModel.country) || null;
		if (this.regions) {
			this.setField('region', this.regions[0].code); // Default to first.
		} else {
			this.setField('region', '');
		}
		this.getTax();
	}

	@Watch('formModel.selectedCard')
	@Watch('formModel.region')
	onTaxFieldsChange() {
		this.getTax();
	}

	selectCard(card?: any) {
		if (card) {
			this.setField('selectedCard', card.id);
		} else {
			this.setField('selectedCard', 0);
			this.getTax();
		}
	}

	private async getTax() {
		let address: any = {};
		if (this.formModel.selectedCard !== 0) {
			const card: any = this.cards.find(i => i.id === this.formModel.selectedCard);
			if (!card) {
				return;
			}
			address = card.user_address;
		} else {
			address = this.formModel;
		}

		if (!address.country || !address.region) {
			this.calculatedTax = true;
			return;
		}

		const data = {
			amount: this.order.amount,
			country: address.country,
			region: address.region,
		};

		this.calculatedTax = false;
		const response = await Api.sendRequest('/web/checkout/taxes', data, {
			detach: true,
		});

		this.calculatedTax = true;
		this.taxAmount = response.amount;
	}

	async onSubmit() {
		this.stripeError = null;

		// New card
		if (this.formModel.selectedCard === 0) {
			// Have to remove the masking.
			const cardNumber = this.formModel.card_number.replace(' ', '');
			const cardExp = this.formModel.exp.replace('/', '');

			const formData = {
				number: cardNumber,
				exp_month: cardExp.substr(0, 2),
				exp_year: cardExp.substr(2, 2),
				cvc: this.formModel.cvc,

				name: this.formModel.fullname,
				address_country: this.formModel.country,
				address_line1: this.formModel.street1,
				address_state: this.formModel.region,
				address_zip: this.formModel.postcode,
			};

			const response = await new Promise<StripeCardTokenResponse>((resolve, reject) => {
				window.Stripe.card.createToken(formData, (_status, stripeResponse) => {
					if (stripeResponse.error) {
						this.stripeError = stripeResponse.error.message;
						reject(stripeResponse);
					} else {
						resolve(stripeResponse);
					}
				});
			});
			const data = {
				save_card: false,
				token: response.id,
				amount: this.order.amount / 100,

				fullname: this.formModel.fullname,
				country: this.formModel.country,
				region: this.formModel.region,
				street1: this.formModel.street1,
				postcode: this.formModel.postcode,
			};

			if (this.app.user) {
				data.save_card = this.formModel.save_card;
			}

			return Api.sendRequest('/web/checkout/charge/' + this.order.id, data);
		} else {
			// Existing/saved card
			const data = { payment_source: this.formModel.selectedCard };
			return Api.sendRequest('/web/checkout/charge/' + this.order.id, data);
		}
	}
}
