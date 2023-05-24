<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { Api } from '../../../_common/api/api.service';
import AppExpand from '../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../_common/filters/currency';
import AppForm, { FormController, createForm } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlMask from '../../../_common/form-vue/AppFormControlMask.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlCheckbox from '../../../_common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlSelect from '../../../_common/form-vue/controls/AppFormControlSelect.vue';
import {
	validateCreditCard,
	validateCreditCardExpiration,
	validateMaxLength,
	validatePattern,
} from '../../../_common/form-vue/validators';
import { Geo, Region } from '../../../_common/geo/geo.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import { Order } from '../../../_common/order/order.model';
import { useCommonStore } from '../../../_common/store/common-store';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';

const props = defineProps({
	cards: {
		type: Array as PropType<any[]>,
		required: true,
	},
	order: {
		type: Object as PropType<Order>,
		required: true,
	},
});

const { cards, order } = toRefs(props);
const { user } = useCommonStore();

const stripeError = ref<string | null>(null);
const countries = Geo.getCountries();
const regions = ref<Region[] | null>(null);
const calculatedTax = ref(false);
const taxAmount = ref(0);

const ccMask = [
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
const expMask = [/\d/, /\d/, '/', /\d/, /\d/];

type FormModel = {
	country: string;
	selectedCard: number;
	save_card: boolean;
	fullname: string;
	card_number: string;
	exp: string;
	cvc: string;
	region: string;
	street1: string;
	postcode: string;
};

const emit = defineEmits({
	submit: (_response: any) => true,
});

const form: FormController<FormModel> = createForm({
	// modelClass: Game,
	// model: toRef(props, 'game'),
	warnOnDiscard: false,
	onInit() {
		form.formModel.country = 'us';
		form.formModel.selectedCard = 0;
		if (cards.value && cards.value.length) {
			form.formModel.selectedCard = cards.value[0].id;
		}

		form.formModel.save_card = true;

		if (GJ_ENVIRONMENT === 'development') {
			form.formModel.fullname = 'Vash the Stampede';
			form.formModel.card_number = '4242424242424242';
			form.formModel.exp = '1225';
			form.formModel.cvc = '123';
			form.formModel.street1 = `No-man's Land`;
			form.formModel.postcode = '11111';
			form.formModel.save_card = false;
		}

		_getTax();
	},
	async onSubmit() {
		stripeError.value = null;

		// New card
		if (form.formModel.selectedCard === 0) {
			// Have to remove the masking.
			const cardNumber = form.formModel.card_number.replace(' ', '');
			const cardExp = form.formModel.exp.replace('/', '');

			const formData = {
				number: cardNumber,
				exp_month: cardExp.substring(0, 2),
				exp_year: cardExp.substring(2, 4),
				cvc: form.formModel.cvc,

				name: form.formModel.fullname,
				address_country: form.formModel.country,
				address_line1: form.formModel.street1,
				address_state: form.formModel.region,
				address_zip: form.formModel.postcode,
			};

			const response = await new Promise<StripeCardTokenResponse>((resolve, reject) => {
				window.Stripe.card.createToken(formData, (_status, stripeResponse) => {
					if (stripeResponse.error) {
						stripeError.value = stripeResponse.error.message;
						reject(stripeResponse);
					} else {
						resolve(stripeResponse);
					}
				});
			});
			const data = {
				save_card: false,
				token: response.id,
				amount: order.value.amount / 100,

				fullname: form.formModel.fullname,
				country: form.formModel.country,
				region: form.formModel.region,
				street1: form.formModel.street1,
				postcode: form.formModel.postcode,
			};

			if (user.value) {
				data.save_card = form.formModel.save_card;
			}

			return Api.sendRequest('/web/checkout/charge/' + order.value.hash, data);
		} else {
			// Existing/saved card
			const data = { payment_source: form.formModel.selectedCard };
			return Api.sendRequest('/web/checkout/charge/' + order.value.hash, data);
		}
	},
	onSubmitSuccess(response) {
		emit('submit', response);
	},
});

watch(
	() => form.formModel.country,
	() => {
		regions.value = Geo.getRegions(form.formModel.country) || null;
		if (regions.value) {
			form.formModel.region = regions.value[0].code; // Default to first.
		} else {
			form.formModel.region = '';
		}

		_getTax();
	}
);

// When tax related fields change.
watch([() => form.formModel.selectedCard, () => form.formModel.region], () => {
	_getTax();
});

function selectCard(card?: any) {
	if (card) {
		form.formModel.selectedCard = card.id;
	} else {
		form.formModel.selectedCard = 0;
		_getTax();
	}
}

async function _getTax() {
	let address: any = {};
	if (form.formModel.selectedCard !== 0) {
		const card: any = cards.value.find(i => i.id === form.formModel.selectedCard);
		if (!card) {
			return;
		}
		address = card.user_address;
	} else {
		address = form.formModel;
	}

	if (!address.country || !address.region) {
		calculatedTax.value = true;
		return;
	}

	const data = {
		amount: order.value.amount,
		country: address.country,
		region: address.region,
	};

	calculatedTax.value = false;
	const response = await Api.sendRequest('/web/checkout/taxes', data, {
		detach: true,
	});

	calculatedTax.value = true;
	taxAmount.value = response.amount;
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
						:class="{ active: form.formModel.selectedCard === card.id }"
						@click="selectCard(card)"
					>
						<div class="pull-left" style="margin-right: 15px">
							<input
								type="radio"
								:checked="form.formModel.selectedCard === card.id"
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
						:class="{ active: !form.formModel.selectedCard }"
						@click="selectCard()"
					>
						<div class="pull-left" style="margin-right: 15px">
							<input
								type="radio"
								:checked="form.formModel.selectedCard === 0"
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
			:when="!form.formModel.selectedCard || !cards.length"
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
										<AppFormControlMask :mask="expMask">
											<AppFormControl
												type="text"
												class="has-icon"
												placeholder="mm/yy"
												:validators="[validateCreditCardExpiration()]"
												validate-on-blur
											/>
										</AppFormControlMask>
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
								v-if="user"
								name="save_card"
								:label="$gettext('Remember card?')"
							>
								<label class="checkbox">
									<AppFormControlCheckbox />
									{{ $gettext(`Remember this card for future purchases`) }}
								</label>
							</AppFormGroup>

							<fieldset>
								<legend>
									{{ $gettext(`Billing Address`) }}
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
			v-if="!calculatedTax && form.valid"
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
			v-if="!form.valid || (calculatedTax && !form.isProcessing)"
			lg
			block
			:disabled="!form.valid"
		>
			{{
				$gettextInterpolate(`Pay %{ amount }`, {
					amount: formatCurrency(order.amount + taxAmount),
				})
			}}
		</AppFormButton>

		<AppLoading
			v-if="form.isProcessing"
			class="loading-centered"
			:label="$gettext(`Processing...`)"
		/>
	</AppForm>
</template>

<style lang="stylus" scoped>
fieldset
	margin-top: $line-height-computed

	& > legend
		font-family: $font-family-heading
		margin-top: 0

::v-deep(.form-group)
	position: relative
	margin-bottom: 6px

	label[for]
		display: none

	.jolticon
		theme-prop('color', 'fg-muted')
		position: absolute
		left: 8px
		top: 11px
		z-index: 3

::v-deep(.form-control)
	position: relative
	height: 40px

	&.has-icon
		padding-left: 33px

.left-col
	float: left
	width: 50%
	padding-right: (6px / 2)

.right-col
	float: right
	width: 50%
	padding-left: (6px / 2)

.checkbox
	theme-prop('color', 'fg-muted')
	cursor: pointer
	font-weight: normal
	font-size: $font-size-small

.new-card-expander
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2)
		margin-right: -($grid-gutter-width / 2)

	&.has-cards .well
		position: relative
		margin-top: 10px

		// Up arrow.
		&::before
			caret(color: var(--theme-bg-offset), direction: 'up', size: 10px)
			content: ''

a.card-list-item
	clearfix()
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	display: block
	padding: 15px
	margin-bottom: 10px
	border-width: 2px
	border-style: solid

	&:hover
		theme-prop('border-color', 'highlight')

	&.active
		theme-prop('border-color', 'highlight')

h4
	font-weight: 300
</style>
