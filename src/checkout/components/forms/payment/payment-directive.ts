import { App } from '../../../app-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Geo } from '../../../../lib/gj-lib-client/components/geo/geo.service';

PaymentComponent.$inject = ['App', 'Form'];
export function PaymentComponent(App: App, Form: any) {
	const form = new Form({
		template: require('./payment.html'),
	});

	form.scope.cards = '=';
	form.scope.order = '=';

	form.onInit = function(scope: any) {
		scope.App = App;

		scope.formState.stripeError = null;
		scope.formState.countries = Geo.getCountries();
		scope.formState.calculatedTax = false;
		scope.formState.taxAmount = 0;

		scope.formModel.country = 'us';
		scope.formModel.selectedCard = 0;
		if (scope.cards && scope.cards.length) {
			scope.formModel.selectedCard = scope.cards[0].id;
		}

		scope.formModel.save_card = true;

		if (Environment.env === 'development') {
			scope.formModel.fullname = 'Vash the Stampede';
			scope.formModel.card_number = '4242424242424242';
			scope.formModel.exp = '1216';
			scope.formModel.cvc = '123';
			scope.formModel.street1 = `No-man's Land`;
			scope.formModel.postcode = '11111';
			scope.formModel.save_card = false;
		}

		scope.$watch('formModel.country', (country: string) => {
			scope.formState.regions = Geo.getRegions(country);
			if (scope.formState.regions) {
				scope.formModel.region = scope.formState.regions[0].code; // Default to first.
			} else {
				scope.formModel.region = '';
			}
		});

		scope.$watchGroup(
			['formModel.selectedCard', 'formModel.country', 'formModel.region'],
			getTax,
		);

		function getTax() {
			let address: any = {};
			if (scope.formModel.selectedCard !== 0) {
				const card: any = _.find(scope.cards, {
					id: scope.formModel.selectedCard,
				});
				if (!card) {
					return;
				}
				address = card.user_address;
			} else {
				address = scope.formModel;
			}

			scope.formState.calculatedTax = false;
			if (!address.country || !address.region) {
				return;
			}

			const data = {
				amount: scope.order.amount,
				country: address.country,
				region: address.region,
			};

			return Api.sendRequest('/web/checkout/taxes', data, {
				detach: true,
			}).then((response: any) => {
				scope.formState.calculatedTax = true;
				scope.formState.taxAmount = response.amount;
			});
		}
	};

	form.onSubmit = function(scope: any) {
		scope.formState.stripeError = null;

		// New card
		if (scope.formModel.selectedCard == 0) {
			const formData = {
				number: scope.formModel.card_number,
				exp_month: scope.formModel.exp.substr(0, 2),
				exp_year: scope.formModel.exp.substr(2, 2),
				cvc: scope.formModel.cvc,

				name: scope.formModel.fullname,
				address_country: scope.formModel.country,
				address_line1: scope.formModel.street1,
				address_state: scope.formModel.region,
				address_zip: scope.formModel.postcode,
			};

			return new Promise((resolve, reject) => {
				window.Stripe.card.createToken(formData, (status, response) => {
					if (status) {
					}

					if (response.error) {
						scope.formState.stripeError = response.error.message;
						reject(response);
					} else {
						resolve(response);
					}
				});
			}).then((response: StripeTokenResponse) => {
				const data = {
					save_card: false,
					token: response.id,
					amount: scope.order.amount / 100,

					fullname: scope.formModel.fullname,
					country: scope.formModel.country,
					region: scope.formModel.region,
					street1: scope.formModel.street1,
					postcode: scope.formModel.postcode,
				};

				if (App.user) {
					data.save_card = scope.formModel.save_card;
				}

				return Api.sendRequest('/web/checkout/charge/' + scope.order.id, data);
			});
		} else {
			// Existing/saved card
			const data = { payment_source: scope.formModel.selectedCard };
			return Api.sendRequest('/web/checkout/charge/' + scope.order.id, data);
		}
	};

	return form;
}
