<template>
	<app-form name="gamePackagePayment" ref="form">
		<template v-if="checkoutStep === 'primary'">
			<div class="alert full-bleed" v-if="partner">
				<span v-translate="{ user: partner.display_name }">
					You've accessed this game through a Game Jolt Partner link! A percentage of this sale will
					go to
					<b>%{ user }</b>
					.
				</span>
				<router-link class="link-help" :to="{ name: 'landing.partners' }" target="_blank">
					<translate>Learn more about the Game Jolt Partner system.</translate>
				</router-link>
			</div>

			<p v-if="sellable.type === 'pwyw'">
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
						This developer suggests paying
						<b>%{ amount }</b>
						, but you're able to pay what you want!
					</span>
				</template>
			</p>
			<p v-else-if="sellable.type === 'paid'">
				<span v-translate="{ amount: formattedAmount }">
					The developer has set the price of this game to
					<b>%{ amount }</b>
					, but you're able to support them by giving more!
				</span>
			</p>

			<div v-if="sellable.type === 'pwyw' && build">
				<a class="small" @click="$emit('skip')">
					<template v-if="operation == 'download'">
						<translate v-if="!GJ_IS_CLIENT">No thanks, take me to the download.</translate>
						<translate v-else>No thanks, just install it.</translate>
					</template>
					<template v-else>
						<translate>No thanks, just play the game.</translate>
					</template>
				</a>
			</div>

			<hr />
		</template>

		<app-loading v-if="!isLoaded" />
		<template v-else>
			<app-loading-fade :is-loading="isProcessing">
				<div
					v-if="checkoutStep === 'primary'"
					:class="{
						'form-horizontal': !Screen.isXs,
						row: Screen.isXs,
					}"
				>
					<app-form-group name="amount" :label="$gettext(`Name your price`)" label-class="col-sm-4">
						<div class="col-sm-8">
							<span class="amount-input">
								<span class="amount-input-currency">$</span>
								<app-form-control
									type="currency"
									step="1"
									:rules="{
										min_value: _minOrderAmount,
									}"
								/>
							</span>

							<span class="text-muted" v-if="sellable.type === 'paid'">
								<translate :translate-params="{ amount: formattedAmount }">
									(%{ amount } or more)
								</translate>
							</span>

							<app-form-control-errors :label="$gettext(`price`)">
								<app-form-control-error
									v-if="sellable.type === 'pwyw'"
									when="min"
									:message="minOrderMessage"
								/>
							</app-form-control-errors>

							<br />

							<p class="small">
								<strong>
									<translate>Support the developer by paying more</translate>
								</strong>
							</p>

							<p>
								<app-button primary sparse @click="addMoney(1)">
									+$1
								</app-button>
								<app-button primary sparse @click="addMoney(2)">
									+$2
								</app-button>
								<app-button primary sparse @click="addMoney(5)">
									+$5
								</app-button>
								<app-button primary sparse @click="addMoney(10)">
									+$10
								</app-button>
							</p>

							<hr />
						</div>
					</app-form-group>

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
								<div v-if="app.user && walletBalance > 0 && hasSufficientWalletFunds">
									<span
										class="saved-card"
										:class="{ disabled: isLoadingMethods }"
										@click="collectAddress('wallet')"
									>
										<div class="saved-card-avatar">
											<img
												:src="app.user.img_avatar"
												class="img-responsive"
												alt=""
												v-app-tooltip="`${app.user.display_name} (@${app.user.username})`"
											/>
										</div>
										<div class="saved-card-content">
											<div class="saved-card-label">
												<translate>Your Wallet</translate>
											</div>
											<div class="small">
												<translate>Balance:</translate>
												{{ walletBalance | currency }}

												<span class="text-muted" v-if="walletTax > 0">
													+{{ walletTax | currency }}
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
														class="img-responsive"
														:src="app.user.img_avatar"
														alt=""
														v-app-tooltip="`${app.user.display_name} (@${app.user.username})`"
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
														class="text-muted"
														v-if="cardsTax[cards[0].id] && cardsTax[cards[0].id].amount > 0"
													>
														+{{ cardsTax[cards[0].id].amount | currency }}
														<translate>tax</translate>
													</small>
												</div>
											</span>
										</div>

										<app-popper v-if="cards.length > 1" class="saved-card-more">
											<span
												:class="{ disabled: isLoadingMethods }"
												v-app-tooltip="$gettext('Select another card')"
											>
												<app-jolticon icon="chevron-down" />
											</span>

											<div slot="popover" class="list-group list-group-dark">
												<a
													class="list-group-item"
													v-for="card of cards"
													:key="card.id"
													@click="checkoutSavedCard(card)"
												>
													<span class="tag">
														{{ card.brand }}
													</span>
													****
													{{ card.last4 }}
													<small
														class="text-muted"
														v-if="cardsTax[card.id] && cardsTax[card.id].amount > 0"
													>
														+{{ cardsTax[card.id].amount | currency }}
														<translate>tax</translate>
													</small>
												</a>
											</div>
										</app-popper>
									</div>
								</template>
							</app-expand>

							<app-form-button icon="credit-card" :solid="false" :primary="false" :disabled="!valid" @before-submit="checkoutCard()">
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
				</div>
				<template v-else-if="checkoutStep === 'address'">
					<div class="alert full-bleed">
						<app-jolticon icon="info-circle" />
						<translate>
							Because of international tax laws, we are required to collect this information.
						</translate>
					</div>

					<div class="row">
						<div class="col-sm-6">
							<app-form-group name="country" :label="$gettext('Country')">
								<app-form-control-select>
									<option v-for="country of countries" :key="country.code" :value="country.code">
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
							<app-form-group name="region" :label="$gettext('State/Province/County')">
								<app-form-control type="text" v-if="!regions" :validate-on="['blur']" />

								<app-form-control-select v-else>
									<option v-for="region of regions" :key="region.code" :value="region.code">
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
							<app-form-button :solid="false" :disabled="!valid" @before-submit="checkoutPaypal()">
								<translate>Proceed to PayPal</translate>
							</app-form-button>
						</div>
						<div v-else-if="checkoutType === 'wallet'">
							<app-loading
								v-if="!calculatedAddressTax && valid"
								class="loading-centered"
								:label="$gettext('Calculating tax...')"
							/>

							<p v-if="calculatedAddressTax && addressTaxAmount > 0" class="anim-fade-in small">
								+{{ addressTaxAmount | currency }}
								<translate>tax</translate>
								<span
									v-app-tooltip="
										$gettext(`We are required to collect taxes on orders for certain regions.`)
									"
								>
									<app-jolticon class="text-muted" icon="help-circle" />
								</span>
							</p>

							<div v-if="!hasSufficientWalletFunds" class="alert">
								<translate>You do not have enough funds in your Wallet for this order.</translate>
							</div>

							<app-button
								primary
								:disabled="!valid || !calculatedAddressTax || !hasSufficientWalletFunds"
								@click="checkoutWallet"
							>
								<translate>Buy Using Wallet</translate>
								<small v-if="calculatedAddressTax">
									{{ (formModel.amount + addressTaxAmount) | currency }}
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

<script lang="ts" src="./payment-form"></script>
