<script lang="ts" setup>
import { PropType, computed, ref, toRefs, watch } from 'vue';
import { arrayIndexBy } from '../../../../utils/array';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/AppButton.vue';
import { getDeviceArch, getDeviceOS } from '../../../device/device.service';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/AppExpand.vue';
import { formatCurrency } from '../../../filters/currency';
import AppForm, { FormController, createForm } from '../../../form-vue/AppForm.vue';
import AppFormButton from '../../../form-vue/AppFormButton.vue';
import AppFormControl from '../../../form-vue/AppFormControl.vue';
import AppFormControlError from '../../../form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../form-vue/controls/AppFormControlSelect.vue';
import { validateMinValue } from '../../../form-vue/validators';
import { Geo, GeoRegion } from '../../../geo/geo.service';
import { showErrorGrowl } from '../../../growls/growls.service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppLoading from '../../../loading/AppLoading.vue';
import AppLoadingFade from '../../../loading/AppLoadingFade.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { OrderPaymentMethod } from '../../../order/payment/payment.model';
import AppPopper from '../../../popper/AppPopper.vue';
import { Screen } from '../../../screen/screen-service';
import { SellableModel, SellableType } from '../../../sellable/sellable.model';
import { useCommonStore } from '../../../store/common-store';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import { $gettext, $gettextInterpolate } from '../../../translate/translate.service';
import { GameBuildModel } from '../../build/build.model';
import { GameModel } from '../../game.model';
import { GamePackageModel } from '../package.model';

type FormModel = any;

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	gamePackage: {
		type: Object as PropType<GamePackageModel>,
		required: true,
	},
	build: {
		type: Object as PropType<GameBuildModel | null>,
		required: false,
		default: null,
	},
	sellable: {
		type: Object as PropType<SellableModel>,
		required: true,
	},
	operation: {
		type: String as PropType<'download' | 'play'>,
		required: true,
	},
});

const emit = defineEmits({
	bought: () => true,
	skip: () => true,
});

const { game, gamePackage, build, sellable, operation } = toRefs(props);
const { user } = useCommonStore();

const isBootstrapped = ref(false);
const isLoadingMethods = ref(true);
const isProcessing = ref(false);
const checkoutType = ref<OrderPaymentMethod>(OrderPaymentMethod.CCStripe);
const checkoutStep = ref('primary');

const cards = ref<any[]>([]);
const cardsTax = ref<Record<string, any>>({});
const addresses = ref<any[]>([]);
const calculatedAddressTax = ref(false);
const addressTaxAmount = ref(0);
const countries = ref(Geo.getCountries());
const regions = ref<GeoRegion[] | null>(null);
const walletBalance = ref(0);
const walletTax = ref(0);
const minOrderAmount = ref(50);

const isNameYourPrice = computed(() => sellable.value.type === 'pwyw');
const isPlaying = computed(() => operation.value === 'play');
const isDownloading = computed(() => operation.value === 'download' && !GJ_IS_DESKTOP_APP);
const isInstalling = computed(() => operation.value === 'download' && GJ_IS_DESKTOP_APP);
const pricing = computed(() => sellable.value.pricings[0]);

const _minOrderAmount = computed(() =>
	sellable.value.type === 'paid' ? pricing.value.amount / 100 : minOrderAmount.value / 100
);

const formattedAmount = computed(() => formatCurrency(pricing.value.amount));

const minOrderMessage = computed(() =>
	$gettextInterpolate(
		`Because of payment processing fees, we are not able to sell this game for less than %{ amount }. You can click the link below to grab the download for free, though!`,
		{ amount: formatCurrency(minOrderAmount.value) }
	)
);

const hasSufficientWalletFunds = computed(() => {
	if (!form.formModel.amount || form.formModel.amount <= 0) {
		return true;
	}

	// When we're filling in the address, pull that tax.
	// Otherwise, when we're on the main page, check the wallet tax amount for their saved address.
	const taxAmount = checkoutStep.value === 'address' ? addressTaxAmount.value : walletTax.value;
	const sellableAmount = pricing.value.amount;
	const currentAmount = form.formModel.amount * 100; // The formModel amount is a decimal.

	// Paid games have to be more than the amount of the game base price.
	if (
		sellable.value.type === SellableType.Paid &&
		walletBalance.value < sellableAmount + taxAmount
	) {
		return false;
	}

	// All games have to be more than they've entered into the box.
	if (walletBalance.value < currentAmount + taxAmount) {
		return false;
	}

	return true;
});

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		// If they don't have a default pricing amount set for this sellable,
		// just do $1.
		form.formModel.amount = pricing.value.amount ? pricing.value.amount / 100 : 1;
		form.formModel.country = 'us';
		load();
	},
	onSubmit() {
		isProcessing.value = true;

		const data: any = {
			payment_method: checkoutType.value,
			sellable_id: sellable.value.id,
			pricing_id: pricing.value.id,
			amount: form.formModel.amount * 100,
			country: form.formModel.country,
			street1: form.formModel.street1,
			region: form.formModel.region,
			postcode: form.formModel.postcode,
		};

		if (!user.value) {
			data.email_address = form.formModel.email_address;
		}

		if (addresses.value.length) {
			data.address_id = addresses.value[0].id;
		}

		data['source'] = HistoryTick.getSource('Game', gamePackage.value.game_id) || null;
		data['os'] = getDeviceOS();
		data['arch'] = getDeviceArch();

		return Api.sendRequest('/web/checkout/setup-order', data, { detach: true });
	},
	onSubmitSuccess(response: any) {
		if (GJ_IS_DESKTOP_APP) {
			// Our checkout can be done in client.
			if (checkoutType.value === OrderPaymentMethod.CCStripe) {
				Navigate.goto(Environment.checkoutBaseUrl + '/checkout/' + response.cart.hash);
			} else {
				// Otherwise we have to open in browser.
				Navigate.gotoExternal(response.redirectUrl);
			}
		} else {
			// For site we have to replace the URL completely since we are switching to https.
			Navigate.goto(response.redirectUrl);
		}
	},
	onSubmitError() {
		isProcessing.value = false;
	},
});

watch(
	() => form.formModel.country,
	() => {
		regions.value = Geo.getRegions(form.formModel.country) || null;
		if (regions.value) {
			// Default to first.
			form.formModel.region = regions.value[0].code;
		} else {
			form.formModel.region = '';
		}
		getAddressTax();
	}
);

watch(
	() => form.formModel.region,
	() => {
		getAddressTax();
	}
);

watch(
	() => form.formModel.amount,
	() => {
		isLoadingMethods.value = true;
		load();
	}
);

async function load() {
	const response = await Api.sendRequest(
		'/web/checkout/methods?amount=' + form.formModel.amount * 100,
		null,
		{ detach: true }
	);

	isLoadingMethods.value = false;
	isBootstrapped.value = true;
	minOrderAmount.value = response.minOrderAmount || 50;

	if (response && response.cards && response.cards.length) {
		cards.value = response.cards;
		cardsTax.value = arrayIndexBy<any>(response.cardsTax, 'id');
	}

	if (response && response.billingAddresses && response.billingAddresses.length) {
		addresses.value = response.billingAddresses;
	}

	if (response && response.walletBalance && response.walletBalance > 0) {
		walletBalance.value = response.walletBalance;
		walletTax.value = response.walletTax;
	}
}

function addMoney(amount: number) {
	let curAmount: number =
		typeof form.formModel.amount === 'string'
			? parseFloat(form.formModel.amount)
			: form.formModel.amount;

	if (!curAmount) {
		curAmount = amount;
	} else {
		curAmount += amount;
		curAmount = parseFloat(curAmount.toFixed(2));
	}
	form.formModel.amount = curAmount;
}

function collectAddress(chosenCheckoutType: OrderPaymentMethod) {
	if (addresses.value.length) {
		if (chosenCheckoutType === OrderPaymentMethod.Paypal) {
			checkoutPaypal();
			form.submit();
			return;
		} else if (chosenCheckoutType === OrderPaymentMethod.Wallet) {
			checkoutWallet();
			return;
		}
	}

	checkoutStep.value = 'address';
	checkoutType.value = chosenCheckoutType;
	calculatedAddressTax.value = false;
	addressTaxAmount.value = 0;

	getAddressTax();
}

async function getAddressTax() {
	calculatedAddressTax.value = false;
	if (!form.formModel.country || !form.formModel.region) {
		return;
	}

	const data = {
		amount: form.formModel.amount * 100,
		country: form.formModel.country,
		region: form.formModel.region,
	};

	const response = await Api.sendRequest('/web/checkout/taxes', data, {
		detach: true,
	});

	calculatedAddressTax.value = true;
	addressTaxAmount.value = response.amount;
}

function checkoutCard() {
	checkoutType.value = OrderPaymentMethod.CCStripe;
}

function checkoutPaypal() {
	checkoutType.value = OrderPaymentMethod.Paypal;
}

function startOver() {
	checkoutStep.value = 'primary';
}

function checkoutSavedCard(card: any) {
	const data: any = {
		payment_method: 'cc-stripe',
		sellable_id: sellable.value.id,
		pricing_id: pricing.value.id,
		amount: form.formModel.amount * 100,
	};

	return doCheckout(data, { payment_source: card.id });
}

function checkoutWallet() {
	const data: any = {
		payment_method: 'wallet',
		sellable_id: sellable.value.id,
		pricing_id: pricing.value.id,
		amount: form.formModel.amount * 100,
	};

	if (addresses.value.length) {
		data.address_id = addresses.value[0].id;
	} else {
		data.country = form.formModel.country;
		data.street1 = form.formModel.street1;
		data.region = form.formModel.region;
		data.postcode = form.formModel.postcode;
	}

	return doCheckout(data, { wallet: true });
}

/**
 * This is for checkouts outside the normal form submit flow.
 * We need to manually handle processing and errors.
 */
async function doCheckout(setupData: any, chargeData: any) {
	if (isLoadingMethods.value || isProcessing.value) {
		return;
	}

	isProcessing.value = true;

	setupData['source'] = HistoryTick.getSource('Game', gamePackage.value.game_id) || null;
	setupData['os'] = getDeviceOS();
	setupData['arch'] = getDeviceArch();

	try {
		let response = await Api.sendRequest('/web/checkout/setup-order', setupData, {
			detach: true,
		});

		if (response.success === false) {
			throw response;
		}

		response = await Api.sendRequest('/web/checkout/charge/' + response.cart.hash, chargeData, {
			detach: true,
		});

		if (response.success === false) {
			throw response;
		}

		// Notify that we've bought this package.
		emit('bought');
	} catch (_e) {
		isProcessing.value = false;

		// This should always succeed, so let's throw a generic message if it fails.
		showErrorGrowl({
			sticky: true,
			message: $gettext(`There was a problem processing your payment method.`),
		});
	}
}
</script>

<template>
	<AppForm :controller="form">
		<template v-if="checkoutStep === 'primary'">
			<p v-if="isNameYourPrice">
				<template v-if="!pricing.amount">
					{{
						$gettextInterpolate(`Show %{ developer } some love by supporting them!`, {
							developer: game.developer.display_name,
						})
					}}
				</template>
				<template v-else>
					{{
						$gettextInterpolate(
							`This developer suggests paying %{ amount }, but you're able to pay what you want!`,
							{ amount: formattedAmount }
						)
					}}
				</template>
			</p>
			<p v-else>
				{{
					$gettextInterpolate(
						`The developer has set the price of this game to %{ amount }, but you're able to support them by giving more!`,
						{ amount: formattedAmount }
					)
				}}
			</p>

			<hr />
		</template>

		<AppLoading v-if="!isBootstrapped" />
		<template v-else>
			<AppLoadingFade :is-loading="isProcessing">
				<div
					v-if="checkoutStep === 'primary'"
					:class="{
						'form-horizontal': !Screen.isXs,
						row: Screen.isXs,
					}"
				>
					<AppFormGroup
						name="amount"
						:label="$gettext(`Name your price`)"
						label-class="col-sm-4"
					>
						<div class="col-sm-8">
							<span class="amount-input">
								<span class="amount-input-currency">$</span>
								<AppFormControl
									type="currency"
									step="1"
									:validators="[validateMinValue(_minOrderAmount)]"
								/>
							</span>

							<span v-if="!isNameYourPrice" class="text-muted">
								{{
									$gettextInterpolate(`(%{ amount } or more)`, {
										amount: formattedAmount,
									})
								}}
							</span>

							<!--
								If it's PWYW and they haven't entered a price in
								yet, don't show an error since technically it's
								valid for them not to pay anything.
							-->
							<AppFormControlErrors
								v-if="!isNameYourPrice || form.formModel.amount > 0"
								:label="$gettext(`price`)"
							>
								<AppFormControlError
									v-if="isNameYourPrice"
									when="min_value"
									:message="minOrderMessage"
								/>
							</AppFormControlErrors>
						</div>
					</AppFormGroup>

					<!--
						If it's PWYW and they haven't entered a price in
						yet, don't show any of the payment options yet.
						We want to make it clear that they can get the
						game for free by showing the link.
					-->
					<AppExpand :when="!isNameYourPrice || form.formModel.amount > 0">
						<div class="row">
							<div class="col-sm-offset-4 col-sm-8">
								<p class="small">
									<strong>
										{{ $gettext(`Support the developer by paying more`) }}
									</strong>
								</p>

								<p>
									<AppButton primary sparse @click="addMoney(1)">+$1</AppButton>
									<AppButton primary sparse @click="addMoney(2)">+$2</AppButton>
									<AppButton primary sparse @click="addMoney(5)">+$5</AppButton>
									<AppButton primary sparse @click="addMoney(10)">
										+$10
									</AppButton>
								</p>

								<hr />
							</div>
						</div>

						<AppFormGroup
							v-if="!user"
							name="email_address"
							:label="$gettext(`Email Address:`)"
							label-class="col-sm-4"
						>
							<div class="col-sm-8">
								<AppFormControl type="email" />
								<AppFormControlErrors :label="$gettext('email address')" />
							</div>
						</AppFormGroup>

						<div class="form-group">
							<label class="col-sm-4 control-label">
								{{ $gettext(`Checkout with:`) }}
							</label>
							<div class="col-sm-8">
								<!--
								If they have any wallet funds, we try let them checkout with their wallet.
								If they don't have enough funds in their wallet for the order, we give 'em a message.
							-->
								<AppExpand :when="form.valid">
									<div
										v-if="user && walletBalance > 0 && hasSufficientWalletFunds"
									>
										<span
											class="saved-card"
											:class="{ disabled: isLoadingMethods }"
											@click="collectAddress(OrderPaymentMethod.Wallet)"
										>
											<div class="saved-card-avatar">
												<img
													v-app-tooltip="
														`${user.display_name} (@${user.username})`
													"
													:src="user.img_avatar"
													class="img-responsive"
													alt=""
												/>
											</div>
											<div class="saved-card-content">
												<div class="saved-card-label">
													{{ $gettext(`Your Wallet`) }}
												</div>
												<div class="small">
													{{ $gettext(`Balance:`) }}
													{{ ' ' }}
													{{ formatCurrency(walletBalance) }}

													<span v-if="walletTax > 0" class="text-muted">
														+{{ formatCurrency(walletTax) }}
														{{ $gettext(`tax`) }}
													</span>
												</div>
											</div>
										</span>
									</div>

									<template v-if="user && cards.length">
										<div class="saved-card-options">
											<div class="saved-card-option">
												<span
													class="saved-card"
													:class="{ disabled: isLoadingMethods }"
													@click="checkoutSavedCard(cards[0])"
												>
													<div class="saved-card-avatar">
														<img
															v-app-tooltip="
																`${user.display_name} (@${user.username})`
															"
															class="img-responsive"
															:src="user.img_avatar"
															alt=""
														/>
													</div>
													<div class="saved-card-content">
														<div class="saved-card-label">
															{{ $gettext(`Saved card`) }}
														</div>
														<span class="tag">
															{{ cards[0].brand }}
														</span>
														<span class="saved-card-number">
															****
															{{ cards[0].last4 }}
														</span>
														<small
															v-if="
																cardsTax[cards[0].id] &&
																cardsTax[cards[0].id].amount > 0
															"
															class="text-muted"
														>
															+{{
																formatCurrency(
																	cardsTax[cards[0].id].amount
																)
															}}
															{{ ' ' }}
															{{ $gettext(`tax`) }}
														</small>
													</div>
												</span>
											</div>

											<AppPopper
												v-if="cards.length > 1"
												class="saved-card-more"
												popover-class="fill-darkest"
											>
												<span
													v-app-tooltip="$gettext('Select another card')"
													:class="{ disabled: isLoadingMethods }"
												>
													<AppJolticon icon="chevron-down" />
												</span>

												<template #popover>
													<div class="list-group list-group-dark">
														<a
															v-for="card of cards"
															:key="card.id"
															class="list-group-item"
															@click="checkoutSavedCard(card)"
														>
															<span class="tag">
																{{ card.brand }}
															</span>
															****
															{{ card.last4 }}
															<small
																v-if="
																	cardsTax[card.id] &&
																	cardsTax[card.id].amount > 0
																"
																class="text-muted"
															>
																+{{
																	formatCurrency(
																		cardsTax[card.id].amount
																	)
																}}
																{{ ' ' }}
																{{ $gettext(`tax`) }}
															</small>
														</a>
													</div>
												</template>
											</AppPopper>
										</div>
									</template>
								</AppExpand>

								<AppFormButton
									icon="credit-card"
									:solid="false"
									:primary="false"
									:disabled="!form.valid"
									@before-submit="checkoutCard()"
								>
									<template v-if="cards.length">
										{{ $gettext(`New card`) }}
									</template>
									<template v-else>
										{{ $gettext(`Card`) }}
									</template>
								</AppFormButton>

								<AppButton
									:disabled="!form.valid"
									@click="collectAddress(OrderPaymentMethod.Paypal)"
								>
									{{ $gettext(`PayPal`) }}
								</AppButton>
							</div>
						</div>
					</AppExpand>

					<div v-if="isNameYourPrice && build" class="row">
						<div class="col-sm-offset-4 col-sm-8">
							<a class="small" @click="emit('skip')">
								<template v-if="isDownloading">
									{{ $gettext(`No thanks, take me to the download.`) }}
								</template>
								<template v-else-if="isInstalling">
									{{ $gettext(`No thanks, just install it.`) }}
								</template>
								<template v-else-if="isPlaying">
									{{ $gettext(`No thanks, take me to the game.`) }}
								</template>
							</a>
						</div>
					</div>
				</div>
				<template v-else-if="checkoutStep === 'address'">
					<div class="alert full-bleed">
						<AppJolticon icon="info-circle" />
						{{
							$gettext(
								`Because of international tax laws, we are required to collect this information.`
							)
						}}
					</div>

					<div class="row">
						<div class="col-sm-6">
							<AppFormGroup name="country" :label="$gettext('Country')">
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
						</div>
					</div>

					<AppFormGroup name="street1" :label="$gettext('Street Address')">
						<AppFormControl type="text" />
						<AppFormControlErrors />
					</AppFormGroup>

					<div class="row">
						<div class="col-sm-6">
							<AppFormGroup name="region" :label="$gettext('State/Province/County')">
								<AppFormControl v-if="!regions" type="text" validate-on-blur />

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
						<div class="col-sm-6">
							<AppFormGroup name="postcode" :label="$gettext('Zip/Postal Code')">
								<AppFormControl type="text" />
								<AppFormControlErrors />
							</AppFormGroup>
						</div>
					</div>

					<div class="form-group">
						<!--
							For some reason the tax amount goes on top of this. Gotta manually hoist it on top.
						-->
						<div class="pull-right small" style="position: relative; z-index: 1">
							<a class="link-muted" @click="startOver">
								&laquo;
								{{ $gettext(`Go back`) }}
							</a>
						</div>

						<div v-if="checkoutType === 'paypal'">
							<AppFormButton
								:solid="false"
								:disabled="!form.valid"
								@before-submit="checkoutPaypal()"
							>
								{{ $gettext(`Proceed to PayPal`) }}
							</AppFormButton>
						</div>
						<div v-else-if="checkoutType === 'wallet'">
							<AppLoading
								v-if="!calculatedAddressTax && form.valid"
								class="loading-centered"
								:label="$gettext('Calculating tax...')"
							/>

							<p
								v-if="calculatedAddressTax && addressTaxAmount > 0"
								class="anim-fade-in small"
							>
								+{{ formatCurrency(addressTaxAmount) }}
								{{ ' ' }}
								{{ $gettext(`tax`) }}
								<AppJolticon
									v-app-tooltip.touchable="
										$gettext(
											`We are required to collect taxes on orders for certain regions.`
										)
									"
									class="text-muted"
									icon="help-circle"
								/>
							</p>

							<div v-if="!hasSufficientWalletFunds" class="alert">
								{{
									$gettext(
										`You do not have enough funds in your Wallet for this order.`
									)
								}}
							</div>

							<AppButton
								primary
								:disabled="
									!form.valid ||
									!calculatedAddressTax ||
									!hasSufficientWalletFunds
								"
								@click="checkoutWallet"
							>
								{{ $gettext(`Buy using Wallet`) }}
								<small v-if="calculatedAddressTax">
									{{
										formatCurrency(
											form.formModel.amount * 100 + addressTaxAmount
										)
									}}
								</small>
							</AppButton>
						</div>
					</div>
				</template>
			</AppLoadingFade>
		</template>
	</AppForm>
</template>

<style lang="stylus" scoped>
.form-group
	margin-bottom: $font-size-base

::v-deep(label)
	font-family: $font-family-base !important

.amount-input
	position: relative
	display: inline-block

	input
		display: inline-block
		width: 120px
		margin-right: 10px
		padding-left: 25px

	&-currency
		theme-prop('color', 'light')
		position: absolute
		content: '$'
		top: 7px
		left: 10px
		z-index: 2

.saved-card
.saved-card-more
	clearfix()
	rounded-corners()
	theme-prop('border-color', 'fg')
	display: inline-block
	padding-left: 20px
	padding-right: 20px
	padding-top: 8px
	padding-bottom: 8px
	border-width: $button-md-outline-border-size
	border-style: solid
	width: 100%
	height: 40px + (@padding-top * 2) + (2px * 2)
	margin-bottom: $line-height-computed
	vertical-align: middle
	cursor: pointer

	&:hover
		theme-prop('color', 'highlight')
		background-color: $black
		border-color: $black

	&.disabled
		pointer-events: none
		opacity: 0.5

.saved-card-options
	clearfix()

	.saved-card-option
		margin-right: 10px + 40px

	.saved-card
		float: left
		display: block
		margin-right: 10px

	.saved-card-more
		float: left
		width: 40px
		padding-left: 0
		padding-right: 0
		line-height: 40px
		text-align: center

		.jolticon
			vertical-align: middle
			cursor: pointer

.saved-card-label
	font-size: $font-size-tiny
	text-transform: uppercase

.saved-card-avatar
	float: left
	width: 40px

.saved-card-content
	margin-left: 50px
</style>
