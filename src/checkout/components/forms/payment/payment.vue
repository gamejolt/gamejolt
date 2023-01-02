<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../_common/filters/currency';
import AppFormControlMask from '../../../../_common/form-vue/AppFormControlMask.vue';
import { vAppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import {
	validateCreditCard,
	validateCreditCardExpiration,
} from '../../../../_common/form-vue/validators';
import { Geo, Region } from '../../../../_common/geo/geo.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Order } from '../../../../_common/order/order.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppExpand,
		AppLoading,
		AppFormControlMask,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppFocusWhen: vAppFocusWhen,
	},
})
export default class FormPayment extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Array) cards!: any[];
	@Prop(Object) order!: Order;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	stripeError: string | null = null;
	countries = Geo.getCountries();
	regions: Region[] | null = null;
	calculatedTax = false;
	taxAmount = 0;

	readonly ccMask = [
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
	readonly expMask = [/\d/, /\d/, '/', /\d/, /\d/];
	readonly formatCurrency = formatCurrency;
	readonly validateCreditCardExpiration = validateCreditCardExpiration;
	readonly validateCreditCard = validateCreditCard;

	created() {
		this.form.warnOnDiscard = false;
	}

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
			this.setField('exp', '1219');
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
</script>

<template>
	<AppForm :controller="form">
		<div class="row">
			<div class="col-sm-6 col-centered">
				<div v-if="cards.length" class="card-list full-bleed-xs">
					<a
						v-for="card of cards"
						:key="card.id"
						class="card-list-item"
						:class="{ active: formModel.selectedCard === card.id }"
						@click="selectCard(card)"
					>
						<div class="pull-left" style="margin-right: 15px">
							<input
								type="radio"
								:checked="formModel.selectedCard === card.id"
								name="same"
							/>
						</div>
						<div class="pull-left">
							<strong>Card ending in {{ card.last4 }}</strong>
							<br />
							<span class="small text-muted">
								Expires {{ card.exp_month }}/{{ card.exp_year }}
							</span>
						</div>
					</a>
					<a
						class="card-list-item"
						:class="{ active: !formModel.selectedCard }"
						@click="selectCard()"
					>
						<div class="pull-left" style="margin-right: 15px">
							<input
								type="radio"
								:checked="formModel.selectedCard === 0"
								name="same"
							/>
						</div>
						<div class="pull-left">
							<strong>Use a new card</strong>
						</div>
					</a>
				</div>
			</div>
		</div>

		<AppExpand
			class="new-card-expander"
			:class="{ 'has-cards': cards.length }"
			:when="!formModel.selectedCard || !cards.length"
		>
			<div class="well fill-offset">
				<div class="row">
					<div class="col-sm-6 col-centered">
						<div class="form-payment-card">
							<AppFormGroup name="fullname" :label="$gettext('name on card')">
								<AppJolticon icon="user" />
								<AppFormControl
									type="text"
									class="has-icon"
									:placeholder="$gettext('name on card')"
									focus
								/>
								<AppFormControlErrors />
							</AppFormGroup>

							<AppFormGroup name="card_number" :label="$gettext('card number')">
								<AppJolticon icon="credit-card" />
								<AppFormControlMask :mask="ccMask">
									<AppFormControl
										type="text"
										class="has-icon"
										:placeholder="$gettext('card number')"
										:validators="[validateCreditCard()]"
										validate-on-blur
									/>
								</AppFormControlMask>
								<AppFormControlErrors>
									<AppFormControlError
										when="credit_card"
										:message="$gettext(`Please enter a valid card number.`)"
									/>
								</AppFormControlErrors>
							</AppFormGroup>

							<div class="clearfix">
								<div class="left-col">
									<AppFormGroup name="exp" :label="$gettext('card expiration')">
										<AppJolticon icon="calendar" />
										<AppFormControl
											type="text"
											class="has-icon"
											placeholder="mm/yy"
											:validators="[validateCreditCardExpiration()]"
											:mask="expMask"
											validate-on-blur
										/>
										<AppFormControlErrors />
									</AppFormGroup>
								</div>
								<div class="right-col">
									<AppFormGroup name="cvc" label="CVC">
										<AppJolticon icon="token" />
										<AppFormControl
											type="text"
											class="has-icon"
											placeholder="cvc"
											:validators="[
												validateMaxLength(4),
												validatePattern(/^[0-9]*$/),
											]"
											validate-on-blur
										/>
										<AppFormControlErrors>
											<AppFormControlError
												when="pattern"
												:message="$gettext(`Please enter a valid cvc.`)"
											/>
										</AppFormControlErrors>
									</AppFormGroup>
								</div>
							</div>

							<AppFormGroup
								v-if="app.user"
								name="save_card"
								:label="$gettext('Remember card?')"
							>
								<label class="checkbox">
									<AppFormControlCheckbox />
									<AppTranslate
										>Remember this card for future purchases</AppTranslate
									>
								</label>
							</AppFormGroup>

							<fieldset>
								<legend>
									<AppTranslate>Billing Address</AppTranslate>
								</legend>

								<AppFormGroup name="country" :label="$gettext('country')">
									<AppFormControlSelect>
										<option
											v-for="country of countries"
											:key="country.code"
											:value="country.code"
										>
											{{ country.name }}
										</option>
									</AppFormControlSelect>
									<AppFormControlErrors />
								</AppFormGroup>

								<AppFormGroup name="street1" :label="$gettext('street address')">
									<AppFormControl
										type="text"
										:placeholder="$gettext('street address')"
									/>
									<AppFormControlErrors />
								</AppFormGroup>

								<div class="clearfix">
									<div class="left-col">
										<AppFormGroup
											name="region"
											:label="$gettext('state/province')"
										>
											<AppFormControl
												v-if="!regions"
												type="text"
												:placeholder="$gettext('state/province')"
											/>

											<AppFormControlSelect v-else>
												<option
													v-for="region of regions"
													:key="region.code"
													:value="region.code"
												>
													{{ region.name }}
												</option>
											</AppFormControlSelect>

											<AppFormControlErrors />
										</AppFormGroup>
									</div>
									<div class="right-col">
										<AppFormGroup name="postcode" :label="$gettext('zip code')">
											<AppFormControl
												type="text"
												:placeholder="$gettext('zip code')"
											/>
											<AppFormControlErrors />
										</AppFormGroup>
									</div>
								</div>
							</fieldset>
						</div>
					</div>
				</div>
			</div>
		</AppExpand>

		<br />

		<AppLoading
			v-if="!calculatedTax && valid"
			class="loading-centered"
			:label="$gettext(`Calculating tax...`)"
		/>

		<div
			v-if="calculatedTax && taxAmount > 0"
			class="anim-fade-in no-animate-leave text-center"
		>
			+{{ formatCurrency(taxAmount) }} taxes
			<span
				v-app-tooltip="
					$gettext(`We are required to collect taxes on orders for certain regions.`)
				"
			>
				<AppJolticon class="text-muted" icon="help-circle" />
			</span>
		</div>
		<br />

		<AppExpand :when="!!stripeError">
			<div class="alert alert-notice">
				{{ stripeError }}
			</div>
		</AppExpand>

		<AppFormButton
			v-if="!valid || (calculatedTax && !form.isProcessing)"
			lg
			block
			:disabled="!valid"
		>
			Pay {{ formatCurrency(order.amount + taxAmount) }}
		</AppFormButton>

		<AppLoading
			v-if="form.isProcessing"
			class="loading-centered"
			:label="$gettext(`Processing...`)"
		/>
	</AppForm>
</template>

<style lang="stylus" src="./payment.styl" scoped></style>
