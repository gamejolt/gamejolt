<script lang="ts" src="./payment"></script>

<template>
	<app-form :controller="form">
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

		<app-expand
			class="new-card-expander"
			:class="{ 'has-cards': cards.length }"
			:when="!formModel.selectedCard || !cards.length"
		>
			<div class="well fill-offset">
				<div class="row">
					<div class="col-sm-6 col-centered">
						<div class="form-payment-card">
							<app-form-group name="fullname" :label="$gettext('name on card')">
								<app-jolticon icon="user" />
								<app-form-control
									v-app-focus-when
									type="text"
									class="has-icon"
									:placeholder="$gettext('name on card')"
								/>
								<app-form-control-errors />
							</app-form-group>

							<app-form-group name="card_number" :label="$gettext('card number')">
								<app-jolticon icon="credit-card" />
								<app-form-control
									type="text"
									class="has-icon"
									:placeholder="$gettext('card number')"
									:rules="{
										credit_card: true,
									}"
									:mask="ccMask"
									:validate-on="['blur']"
								/>
								<app-form-control-errors>
									<app-form-control-error
										when="credit_card"
										:message="$gettext(`Please enter a valid card number.`)"
									/>
								</app-form-control-errors>
							</app-form-group>

							<div class="clearfix">
								<div class="left-col">
									<app-form-group name="exp" :label="$gettext('card expiration')">
										<app-jolticon icon="calendar" />
										<app-form-control
											type="text"
											class="has-icon"
											placeholder="mm/yy"
											:validators="[validateCreditCardExpiration()]"
											:mask="expMask"
											:validate-on="['blur']"
										/>
										<app-form-control-errors />
									</app-form-group>
								</div>
								<div class="right-col">
									<app-form-group name="cvc" label="CVC">
										<app-jolticon icon="token" />
										<app-form-control
											type="text"
											class="has-icon"
											placeholder="cvc"
											:validators="[
												validateMaxLength(4),
												validatePattern(/^[0-9]*$/),
											]"
											:validate-on="['blur']"
										/>
										<app-form-control-errors>
											<app-form-control-error
												when="pattern"
												:message="$gettext(`Please enter a valid cvc.`)"
											/>
										</app-form-control-errors>
									</app-form-group>
								</div>
							</div>

							<app-form-group
								v-if="app.user"
								name="save_card"
								:label="$gettext('Remember card?')"
							>
								<label class="checkbox">
									<app-form-control-checkbox />
									<translate>Remember this card for future purchases</translate>
								</label>
							</app-form-group>

							<fieldset>
								<legend>
									<translate>Billing Address</translate>
								</legend>

								<app-form-group name="country" :label="$gettext('country')">
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

								<app-form-group name="street1" :label="$gettext('street address')">
									<app-form-control
										type="text"
										:placeholder="$gettext('street address')"
									/>
									<app-form-control-errors />
								</app-form-group>

								<div class="clearfix">
									<div class="left-col">
										<app-form-group
											name="region"
											:label="$gettext('state/province')"
										>
											<app-form-control
												v-if="!regions"
												type="text"
												:placeholder="$gettext('state/province')"
											/>

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
									<div class="right-col">
										<app-form-group
											name="postcode"
											:label="$gettext('zip code')"
										>
											<app-form-control
												type="text"
												:placeholder="$gettext('zip code')"
											/>
											<app-form-control-errors />
										</app-form-group>
									</div>
								</div>
							</fieldset>
						</div>
					</div>
				</div>
			</div>
		</app-expand>

		<br />

		<app-loading
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
				<app-jolticon class="text-muted" icon="help-circle" />
			</span>
		</div>
		<br />

		<app-expand :when="!!stripeError">
			<div class="alert alert-notice">
				{{ stripeError }}
			</div>
		</app-expand>

		<app-form-button
			v-if="!valid || (calculatedTax && !form.isProcessing)"
			lg
			block
			:disabled="!valid"
		>
			Pay {{ formatCurrency(order.amount + taxAmount) }}
		</app-form-button>

		<app-loading
			v-if="form.isProcessing"
			class="loading-centered"
			:label="$gettext(`Processing...`)"
		/>
	</app-form>
</template>

<style lang="stylus" src="./payment.styl" scoped></style>
