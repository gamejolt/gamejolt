<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../utils/array';
import { Api } from '../../../api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../device/device.service';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/AppExpand.vue';
import { formatCurrency } from '../../../filters/currency';
import { vAppFocusWhen } from '../../../form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../form-vue/form.service';
import { Geo, Region } from '../../../geo/geo.service';
import { showErrorGrowl } from '../../../growls/growls.service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import AppLoading from '../../../loading/AppLoading.vue';
import AppLoadingFade from '../../../loading/AppLoadingFade.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { OrderPayment } from '../../../order/payment/payment.model';
import AppPopper from '../../../popper/AppPopper.vue';
import { Screen } from '../../../screen/screen-service';
import { Sellable, SellableType } from '../../../sellable/sellable.model';
import { useCommonStore } from '../../../store/common-store';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import { User } from '../../../user/user.model';
import { GameBuild } from '../../build/build.model';
import { Game } from '../../game.model';
import { GamePackage } from '../package.model';

type CheckoutType = 'cc-stripe' | 'paypal' | 'wallet';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppLoading,
		AppLoadingFade,
		AppExpand,
		AppPopper,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppFocusWhen: vAppFocusWhen,
	},
})
export default class FormGamePackagePayment
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError
{
	@Prop(Object) game!: Game;
	@Prop(Object) package!: GamePackage;
	@Prop(Object) build?: GameBuild;
	@Prop(Object) sellable!: Sellable;
	@Prop(String) partnerKey?: string;
	@Prop(Object) partner?: User;
	@Prop(String) operation!: 'download' | 'play';

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	isBootstrapped = false;
	isLoadingMethods = true;
	isProcessing = false;
	checkoutType: CheckoutType = 'cc-stripe';
	checkoutStep = 'primary';

	cards: any[] = [];
	cardsTax: { [k: string]: any } = {};
	addresses: any[] = [];
	calculatedAddressTax = false;
	addressTaxAmount = 0;
	countries = Geo.getCountries();
	regions: Region[] | null = null;
	walletBalance = 0;
	walletTax = 0;
	minOrderAmount = 50;

	readonly Screen = Screen;
	readonly formatCurrency = formatCurrency;

	@Emit('bought')
	emitBought() {}

	@Emit('skip')
	emitSkip() {}

	get isNameYourPrice() {
		return this.sellable.type === 'pwyw';
	}

	get isPlaying() {
		return this.operation === 'play';
	}

	get isDownloading() {
		return this.operation === 'download' && !GJ_IS_DESKTOP_APP;
	}

	get isInstalling() {
		return this.operation === 'download' && GJ_IS_DESKTOP_APP;
	}

	get pricing() {
		return this.sellable.pricings[0];
	}

	get _minOrderAmount() {
		return this.sellable.type === 'paid'
			? this.pricing.amount / 100
			: this.minOrderAmount / 100;
	}

	get formattedAmount() {
		return formatCurrency(this.pricing.amount);
	}

	get minOrderMessage() {
		return this.$gettextInterpolate(
			`Because of payment processing fees, we are not able to sell this game for less than %{ amount }. You can click the link below to grab the download for free, though!`,
			{ amount: formatCurrency(this.minOrderAmount) }
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
			this.sellable.type === SellableType.Paid &&
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

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		// If they don't have a default pricing amount set for this sellable,
		// just do $1.
		this.setField('amount', this.pricing.amount ? this.pricing.amount / 100 : 1);
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
		this.isBootstrapped = true;
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
				this.form.submit();
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

		this.getAddressTax();
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
		setupData['os'] = getDeviceOS();
		setupData['arch'] = getDeviceArch();
		setupData['ref'] = this.partnerKey || null;

		try {
			let response = await Api.sendRequest('/web/checkout/setup-order', setupData, {
				detach: true,
			});

			if (response.success === false) {
				throw response;
			}

			response = await Api.sendRequest(
				'/web/checkout/charge/' + response.cart.hash,
				chargeData,
				{
					detach: true,
				}
			);

			if (response.success === false) {
				throw response;
			}

			// Notify that we've bought this package.
			this.emitBought();
		} catch (_e) {
			this.isProcessing = false;

			// This should always succeed, so let's throw a generic message if it fails.
			showErrorGrowl({
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
		data['os'] = getDeviceOS();
		data['arch'] = getDeviceArch();
		data['ref'] = this.partnerKey || null;

		return Api.sendRequest('/web/checkout/setup-order', data, { detach: true });
	}

	onSubmitSuccess(response: any) {
		if (GJ_IS_DESKTOP_APP) {
			// Our checkout can be done in client.
			if (this.checkoutType === OrderPayment.METHOD_CC_STRIPE) {
				Navigate.goto(Environment.checkoutBaseUrl + '/checkout/' + response.cart.hash);
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
</script>

<template>
	<AppForm :controller="form">
		<template v-if="checkoutStep === 'primary'">
			<div v-if="partner" class="alert full-bleed">
				<span v-translate="{ user: partner.display_name }">
					You've accessed this game through a Game Jolt Partner link! A percentage of this
					sale will go to %{ user }.
				</span>
				{{ ' ' }}
				<router-link class="link-help" :to="{ name: 'landing.partners' }" target="_blank">
					<AppTranslate>Learn more about the Game Jolt Partner system.</AppTranslate>
				</router-link>
			</div>

			<p v-if="isNameYourPrice">
				<template v-if="!pricing.amount">
					<AppTranslate
						:translate-params="{
							developer: game.developer.display_name,
						}"
					>
						Show %{ developer } some love by supporting them!
					</AppTranslate>
				</template>
				<template v-else>
					<span v-translate="{ amount: formattedAmount }">
						This developer suggests paying %{ amount }, but you're able to pay what you
						want!
					</span>
				</template>
			</p>
			<p v-else>
				<span v-translate="{ amount: formattedAmount }">
					The developer has set the price of this game to %{ amount }, but you're able to
					support them by giving more!
				</span>
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
								<AppTranslate :translate-params="{ amount: formattedAmount }">
									(%{ amount } or more)
								</AppTranslate>
							</span>

							<!--
								If it's PWYW and they haven't entered a price in
								yet, don't show an error since technically it's
								valid for them not to pay anything.
							-->
							<AppFormControlErrors
								v-if="!isNameYourPrice || formModel.amount > 0"
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
					<AppExpand :when="!isNameYourPrice || formModel.amount > 0">
						<div class="row">
							<div class="col-sm-offset-4 col-sm-8">
								<p class="small">
									<strong>
										<AppTranslate
											>Support the developer by paying more</AppTranslate
										>
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
							v-if="!app.user"
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
								<AppTranslate>Checkout with:</AppTranslate>
							</label>
							<div class="col-sm-8">
								<!--
								If they have any wallet funds, we try let them checkout with their wallet.
								If they don't have enough funds in their wallet for the order, we give 'em a message.
							-->
								<AppExpand :when="valid">
									<div
										v-if="
											app.user &&
											walletBalance > 0 &&
											hasSufficientWalletFunds
										"
									>
										<span
											class="saved-card"
											:class="{ disabled: isLoadingMethods }"
											@click="collectAddress('wallet')"
										>
											<div class="saved-card-avatar">
												<img
													v-app-tooltip="
														`${app.user.display_name} (@${app.user.username})`
													"
													:src="app.user.img_avatar"
													class="img-responsive"
													alt=""
												/>
											</div>
											<div class="saved-card-content">
												<div class="saved-card-label">
													<AppTranslate>Your Wallet</AppTranslate>
												</div>
												<div class="small">
													<AppTranslate>Balance:</AppTranslate>
													{{ formatCurrency(walletBalance) }}

													<span v-if="walletTax > 0" class="text-muted">
														+{{ formatCurrency(walletTax) }}
														<AppTranslate>tax</AppTranslate>
													</span>
												</div>
											</div>
										</span>
									</div>

									<template v-if="app.user && cards.length">
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
																`${app.user.display_name} (@${app.user.username})`
															"
															class="img-responsive"
															:src="app.user.img_avatar"
															alt=""
														/>
													</div>
													<div class="saved-card-content">
														<div class="saved-card-label">
															<AppTranslate>Saved Card</AppTranslate>
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
															<AppTranslate>tax</AppTranslate>
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
																<AppTranslate>tax</AppTranslate>
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
									:disabled="!valid"
									@before-submit="checkoutCard()"
								>
									<template v-if="cards.length">
										<AppTranslate>New Card</AppTranslate>
									</template>
									<template v-else>
										<AppTranslate>Card</AppTranslate>
									</template>
								</AppFormButton>

								<AppButton :disabled="!valid" @click="collectAddress('paypal')">
									<AppTranslate>PayPal</AppTranslate>
								</AppButton>
							</div>
						</div>
					</AppExpand>

					<div v-if="isNameYourPrice && build" class="row">
						<div class="col-sm-offset-4 col-sm-8">
							<a class="small" @click="emitSkip()">
								<AppTranslate v-if="isDownloading">
									No thanks, take me to the download.
								</AppTranslate>
								<AppTranslate v-else-if="isInstalling">
									No thanks, just install it.
								</AppTranslate>
								<AppTranslate v-else-if="isPlaying">
									No thanks, take me to the game.
								</AppTranslate>
							</a>
						</div>
					</div>
				</div>
				<template v-else-if="checkoutStep === 'address'">
					<div class="alert full-bleed">
						<AppJolticon icon="info-circle" />
						<AppTranslate>
							Because of international tax laws, we are required to collect this
							information.
						</AppTranslate>
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
								<AppTranslate>Go back</AppTranslate>
							</a>
						</div>

						<div v-if="checkoutType === 'paypal'">
							<AppFormButton
								:solid="false"
								:disabled="!valid"
								@before-submit="checkoutPaypal()"
							>
								<AppTranslate>Proceed to PayPal</AppTranslate>
							</AppFormButton>
						</div>
						<div v-else-if="checkoutType === 'wallet'">
							<AppLoading
								v-if="!calculatedAddressTax && valid"
								class="loading-centered"
								:label="$gettext('Calculating tax...')"
							/>

							<p
								v-if="calculatedAddressTax && addressTaxAmount > 0"
								class="anim-fade-in small"
							>
								+{{ formatCurrency(addressTaxAmount) }}
								<AppTranslate>tax</AppTranslate>
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
								<AppTranslate>
									You do not have enough funds in your Wallet for this order.
								</AppTranslate>
							</div>

							<AppButton
								primary
								:disabled="
									!valid || !calculatedAddressTax || !hasSufficientWalletFunds
								"
								@click="checkoutWallet"
							>
								<AppTranslate>Buy Using Wallet</AppTranslate>
								<small v-if="calculatedAddressTax">
									{{ formatCurrency(formModel.amount * 100 + addressTaxAmount) }}
								</small>
							</AppButton>
						</div>
					</div>
				</template>
			</AppLoadingFade>
		</template>
	</AppForm>
</template>

<style lang="stylus" src="./payment-form.styl" scoped></style>
