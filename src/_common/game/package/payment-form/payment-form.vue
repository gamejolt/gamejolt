<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../utils/array';
import { Api } from '../../../api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../device/device.service';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/AppExpand.vue';
import { formatCurrency } from '../../../filters/currency';
import { AppFocusWhen } from '../../../form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../form-vue/form.service';
import { Geo, Region } from '../../../geo/geo.service';
import { showErrorGrowl } from '../../../growls/growls.service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import AppLoadingFade from '../../../loading/AppLoadingFade.vue';
import AppLoading from '../../../loading/loading.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { OrderPayment } from '../../../order/payment/payment.model';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { Sellable } from '../../../sellable/sellable.model';
import { useCommonStore } from '../../../store/common-store';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
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
		AppTooltip,
		AppFocusWhen,
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
		setupData['os'] = getDeviceArch();
		setupData['arch'] = getDeviceOS();
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
</script>

<template>
	<app-form :controller="form">
		<template v-if="checkoutStep === 'primary'">
			<div v-if="partner" class="alert full-bleed">
				<span v-translate="{ user: partner.display_name }">
					You've accessed this game through a Game Jolt Partner link! A percentage of this
					sale will go to %{ user }.
				</span>
				<router-link class="link-help" :to="{ name: 'landing.partners' }" target="_blank">
					<translate>Learn more about the Game Jolt Partner system.</translate>
				</router-link>
			</div>

			<p v-if="isNameYourPrice">
				<template v-if="!pricing.amount">
					<translate
						:translate-params="{
							developer: game.developer.display_name,
						}"
					>
						Show %{ developer } some love by supporting them!
					</translate>
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

		<app-loading v-if="!isBootstrapped" />
		<template v-else>
			<app-loading-fade :is-loading="isProcessing">
				<div
					v-if="checkoutStep === 'primary'"
					:class="{
						'form-horizontal': !Screen.isXs,
						row: Screen.isXs,
					}"
				>
					<app-form-group
						name="amount"
						:label="$gettext(`Name your price`)"
						label-class="col-sm-4"
					>
						<div class="col-sm-8">
							<span class="amount-input">
								<span class="amount-input-currency">$</span>
								<app-form-control
									type="currency"
									step="1"
									:validators="[validateMinValue(_minOrderAmount)]"
								/>
							</span>

							<span v-if="!isNameYourPrice" class="text-muted">
								<translate :translate-params="{ amount: formattedAmount }">
									(%{ amount } or more)
								</translate>
							</span>

							<!--
								If it's PWYW and they haven't entered a price in
								yet, don't show an error since technically it's
								valid for them not to pay anything.
							-->
							<app-form-control-errors
								v-if="!isNameYourPrice || formModel.amount > 0"
								:label="$gettext(`price`)"
							>
								<app-form-control-error
									v-if="isNameYourPrice"
									when="min_value"
									:message="minOrderMessage"
								/>
							</app-form-control-errors>
						</div>
					</app-form-group>

					<!--
						If it's PWYW and they haven't entered a price in
						yet, don't show any of the payment options yet.
						We want to make it clear that they can get the
						game for free by showing the link.
					-->
					<app-expand :when="!isNameYourPrice || formModel.amount > 0">
						<div class="row">
							<div class="col-sm-offset-4 col-sm-8">
								<p class="small">
									<strong>
										<translate>Support the developer by paying more</translate>
									</strong>
								</p>

								<p>
									<app-button primary sparse @click="addMoney(1)">+$1</app-button>
									<app-button primary sparse @click="addMoney(2)">+$2</app-button>
									<app-button primary sparse @click="addMoney(5)">+$5</app-button>
									<app-button primary sparse @click="addMoney(10)">
										+$10
									</app-button>
								</p>

								<hr />
							</div>
						</div>

						<app-form-group
							v-if="!app.user"
							name="email_address"
							:label="$gettext(`Email Address:`)"
							label-class="col-sm-4"
						>
							<div class="col-sm-8">
								<app-form-control type="email" />
								<app-form-control-errors :label="$gettext('email address')" />
							</div>
						</app-form-group>

						<div class="form-group">
							<label class="col-sm-4 control-label">
								<translate>Checkout with:</translate>
							</label>
							<div class="col-sm-8">
								<!--
								If they have any wallet funds, we try let them checkout with their wallet.
								If they don't have enough funds in their wallet for the order, we give 'em a message.
							-->
								<app-expand :when="valid">
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
													<translate>Your Wallet</translate>
												</div>
												<div class="small">
													<translate>Balance:</translate>
													{{ formatCurrency(walletBalance) }}

													<span v-if="walletTax > 0" class="text-muted">
														+{{ formatCurrency(walletTax) }}
														<translate>tax</translate>
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
															<translate>Saved Card</translate>
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
															<translate>tax</translate>
														</small>
													</div>
												</span>
											</div>

											<app-popper
												v-if="cards.length > 1"
												class="saved-card-more"
												popover-class="fill-darkest"
											>
												<span
													v-app-tooltip="$gettext('Select another card')"
													:class="{ disabled: isLoadingMethods }"
												>
													<app-jolticon icon="chevron-down" />
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
																<translate>tax</translate>
															</small>
														</a>
													</div>
												</template>
											</app-popper>
										</div>
									</template>
								</app-expand>

								<app-form-button
									icon="credit-card"
									:solid="false"
									:primary="false"
									:disabled="!valid"
									@before-submit="checkoutCard()"
								>
									<template v-if="cards.length">
										<translate>New Card</translate>
									</template>
									<template v-else>
										<translate>Card</translate>
									</template>
								</app-form-button>

								<app-button :disabled="!valid" @click="collectAddress('paypal')">
									<translate>PayPal</translate>
								</app-button>
							</div>
						</div>
					</app-expand>

					<div v-if="isNameYourPrice && build" class="row">
						<div class="col-sm-offset-4 col-sm-8">
							<a class="small" @click="emitSkip()">
								<translate v-if="isDownloading">
									No thanks, take me to the download.
								</translate>
								<translate v-else-if="isInstalling">
									No thanks, just install it.
								</translate>
								<translate v-else-if="isPlaying">
									No thanks, take me to the game.
								</translate>
							</a>
						</div>
					</div>
				</div>
				<template v-else-if="checkoutStep === 'address'">
					<div class="alert full-bleed">
						<app-jolticon icon="info-circle" />
						<translate>
							Because of international tax laws, we are required to collect this
							information.
						</translate>
					</div>

					<div class="row">
						<div class="col-sm-6">
							<app-form-group name="country" :label="$gettext('Country')">
								<app-form-control-select>
									<option
										v-for="country of countries"
										:key="country.code"
										:value="country.code"
									>
										{{ country.name }}
									</option>
								</app-form-control-select>
								<app-form-control-errors />
							</app-form-group>
						</div>
					</div>

					<app-form-group name="street1" :label="$gettext('Street Address')">
						<app-form-control type="text" />
						<app-form-control-errors />
					</app-form-group>

					<div class="row">
						<div class="col-sm-6">
							<app-form-group
								name="region"
								:label="$gettext('State/Province/County')"
							>
								<app-form-control v-if="!regions" type="text" validate-on-blur />

								<app-form-control-select v-else>
									<option
										v-for="region of regions"
										:key="region.code"
										:value="region.code"
									>
										{{ region.name }}
									</option>
								</app-form-control-select>

								<app-form-control-errors />
							</app-form-group>
						</div>
						<div class="col-sm-6">
							<app-form-group name="postcode" :label="$gettext('Zip/Postal Code')">
								<app-form-control type="text" />
								<app-form-control-errors />
							</app-form-group>
						</div>
					</div>

					<div class="form-group">
						<!--
							For some reason the tax amount goes on top of this. Gotta manually hoist it on top.
						-->
						<div class="pull-right small" style="position: relative; z-index: 1">
							<a class="link-muted" @click="startOver">
								&laquo;
								<translate>Go back</translate>
							</a>
						</div>

						<div v-if="checkoutType === 'paypal'">
							<app-form-button
								:solid="false"
								:disabled="!valid"
								@before-submit="checkoutPaypal()"
							>
								<translate>Proceed to PayPal</translate>
							</app-form-button>
						</div>
						<div v-else-if="checkoutType === 'wallet'">
							<app-loading
								v-if="!calculatedAddressTax && valid"
								class="loading-centered"
								:label="$gettext('Calculating tax...')"
							/>

							<p
								v-if="calculatedAddressTax && addressTaxAmount > 0"
								class="anim-fade-in small"
							>
								+{{ formatCurrency(addressTaxAmount) }}
								<translate>tax</translate>
								<app-jolticon
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
								<translate>
									You do not have enough funds in your Wallet for this order.
								</translate>
							</div>

							<app-button
								primary
								:disabled="
									!valid || !calculatedAddressTax || !hasSufficientWalletFunds
								"
								@click="checkoutWallet"
							>
								<translate>Buy Using Wallet</translate>
								<small v-if="calculatedAddressTax">
									{{ formatCurrency(formModel.amount * 100 + addressTaxAmount) }}
								</small>
							</app-button>
						</div>
					</div>
				</template>
			</app-loading-fade>
		</template>
	</app-form>
</template>

<style lang="stylus" src="./payment-form.styl" scoped></style>
