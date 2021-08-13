<script lang="ts" src="./managed-account"></script>

<template>
	<app-form name="managedAccountForm" class="form-dashboard-managed-account">
		<app-loading v-if="!isLoaded" />

		<div v-if="isLoaded">
			<!--
				Account initialization.
				We need this information first.
			-->
			<div v-if="!account.is_stripe_initialized">
				<app-form-group name="type" :label="$gettext('Account Type')">
					<div class="radio">
						<label>
							<app-form-control-radio value="individual" />
							<translate>Individual</translate>
							<br />
							<span class="help-inline">
								<translate>
									Are you a sole proprietor, partnership or otherwise an
									individual human being?
								</translate>
							</span>
						</label>
					</div>
					<div class="radio">
						<label>
							<app-form-control-radio value="company" />
							<translate>Company</translate>
							<br />
							<span class="help-inline">
								<translate>
									Are you a company / corporation / business / charity / trust
									fund / etc?
								</translate>
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="country_code" :label="$gettext('Country Code')">
					<p class="help-block">
						<translate>
							Select the country of your residence or the country that your business
							is legally established in. We're working hard on expanding our reach,
							and hope to get more countries supported soon.
						</translate>
					</p>

					<app-form-control-select>
						<option value="">
							<translate>Please select your country...</translate>
						</option>
						<option
							v-for="(country, code) of stripe.countries"
							:key="code"
							:value="code"
						>
							{{ Geo.getCountryName(code) }}
						</option>
					</app-form-control-select>
					<app-form-control-errors label="country" />

					<app-expand :when="!formModel.country_code">
						<br />
						<div class="alert sans-margin-bottom">
							<p>
								<translate>
									If you do not see your country above, all is not lost! We can
									still manually approve your account.
								</translate>
							</p>
							<p>
								<app-link-external href="https://goo.gl/forms/igg8T9dQnZLT2c1l2">
									<translate>Request manual approval here.</translate>
								</app-link-external>
							</p>
						</div>
					</app-expand>
				</app-form-group>
			</div>

			<div v-if="account.is_stripe_initialized">
				<div class="alert">
					<p>
						<translate>
							This information is needed for tax purposes as well as account
							verification. We use Stripe to store and verify this data.
						</translate>
						<app-link-help page="why-tax-forms" class="link-help">
							<translate>Learn more</translate>
						</app-link-help>
					</p>
				</div>

				<div v-if="isVerificationPending" class="alert alert-notice">
					<p>
						<strong>
							<translate>
								Stripe is in the process of verifying your details.
							</translate>
						</strong>
						<translate>
							This can take anywhere from a few minutes to a few days. We'll contact
							you when the verification process is complete and if Stripe requires
							additional supporting documents (such as a photo ID) in order to
							identify you. Hang tight!
						</translate>
					</p>
				</div>

				<div v-if="requiresVerificationDocument" class="alert alert-notice">
					<p>
						<strong>
							<translate>
								Stripe needs additional identification documents in order to verify
								your account.
							</translate>
						</strong>
						<translate>Please enter them below.</translate>
					</p>
				</div>

				<div class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-4">
							<translate>Country</translate>
						</label>
						<div class="form-static col-sm-8">
							{{ Geo.getCountryName(account.country_code) }}
						</div>
					</div>

					<div class="form-group">
						<label class="control-label col-sm-4">
							<translate>Business Type</translate>
						</label>
						<div class="form-static col-sm-8">
							<template v-if="account.type === 'individual'">
								<translate>Individual</translate>
							</template>
							<template v-else-if="account.type === 'company'">
								<translate>Company</translate>
							</template>
						</div>
					</div>
				</div>

				<hr />

				<!--<pre>{{ stripeMeta | json }}</pre>-->
				<!--<pre>{{ stripe.current.verification | json }}</pre>-->
				<!--<pre>{{ formModel | json }}</pre>-->

				<!--
					Individual Account Setup
				-->
				<div v-if="account.type === 'individual'">
					<h4><translate>Your Details</translate></h4>

					<div v-if="account.status === 'unverified'" class="alert">
						<p><translate>Please fill in your personal information.</translate></p>
					</div>

					<app-financials-managed-account-person
						ref="individual"
						name-prefix="individual"
						:country-code="account.country_code"
					/>
				</div>

				<!--
					Company Account Setup
				-->
				<div v-else-if="account.type === 'company'">
					<h4><translate>Company Details</translate></h4>

					<app-financials-managed-account-company-details />

					<h4><translate>Representative Details</translate></h4>

					<div v-if="account.status === 'unverified'" class="alert">
						<p>
							<translate>
								We are required to collection information for a representative of
								your company.
							</translate>
						</p>
					</div>

					<app-financials-managed-account-person
						v-if="representative"
						ref="representative"
						:name-prefix="representative.id"
					/>
				</div>
			</div>

			<!--
				There may be a specific error message, or a generic one.
			-->
			<app-expand :when="!!genericError">
				<div class="alert alert-notice">
					<p v-if="genericError !== true">{{ genericError }}</p>
					<p v-else-if="!account.is_stripe_initialized">
						<translate>
							Something went wrong. Please check that you've entered everything
							correctly.
						</translate>
					</p>
					<p v-else>
						<translate>
							Something went wrong. Please check that you've entered everything
							correctly. This is usually because of an invalid zip/postal code,
							invalid SSN/EIN or phone number.
						</translate>
					</p>
				</div>
			</app-expand>

			<app-loading v-if="state.isProcessing" :label="$gettext(`Processing...`)" />

			<app-form-button v-if="!isComplete && !isVerificationPending">
				<translate>Save and Continue</translate>
			</app-form-button>

			<br />
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.form-dashboard-managed-account
	// Less spacing.
	::v-deep(.form-horizontal)
		.form-group
			margin-bottom: 10px

		.control-label
			padding-top: 0
</style>
