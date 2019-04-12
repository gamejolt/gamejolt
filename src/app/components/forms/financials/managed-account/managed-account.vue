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
									Are you a sole proprietor, partnership or otherwise an individual human being?
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
									Are you a company / corporation / business / charity / trust fund / etc?
								</translate>
							</span>
						</label>
					</div>
					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="country_code" :label="$gettext('Country Code')">
					<p class="help-block">
						<translate>
							Select the country of your residence or the country that your business is legally
							established in. We're working hard on expanding our reach, and hope to get more
							countries supported soon.
						</translate>
					</p>

					<app-form-control-select>
						<option value=""><translate>Please select your country...</translate></option>
						<option v-for="(country, code) of stripe.countries" :key="code" :value="code">
							{{ Geo.getCountryName(code) }}
						</option>
					</app-form-control-select>
					<app-form-control-errors label="country" />

					<app-expand :when="!formModel.country_code">
						<br />
						<div class="alert sans-margin-bottom">
							<p>
								<translate>
									If you do not see your country above, all is not lost! We can still manually
									approve your account.
								</translate>
							</p>
							<p>
								<a href="https://goo.gl/forms/igg8T9dQnZLT2c1l2" target="_blank">
									<translate>Request manual approval here.</translate>
								</a>
							</p>
						</div>
					</app-expand>
				</app-form-group>
			</div>

			<div v-if="account.is_stripe_initialized">
				<div class="alert">
					<p>
						<translate>
							This information is needed for tax purposes as well as account verification. We use
							Stripe to store and verify this data.
						</translate>
						<a href="https://help.gamejolt.com/why-tax-forms" class="link-help" target="_blank">
							<translate>Learn more</translate>
						</a>
					</p>
				</div>

				<div class="alert alert-notice" v-if="isVerificationPending">
					<p>
						<strong>
							<translate>Stripe is in the process of verifying your details.</translate>
						</strong>
						<translate>
							This can take anywhere from a few minutes to a few days. We'll contact you when the
							verification process is complete and if Stripe requires additional supporting
							documents (such as a photo ID) in order to identify you. Hang tight!
						</translate>
					</p>
				</div>

				<div class="alert alert-notice" v-if="requiresVerificationDocument">
					<p>
						<strong>
							<translate>
								Stripe needs additional identification documents in order to verify your account.
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
				Company Info
			-->
				<div v-if="account.type === 'company'">
					<h4><translate>Company Details</translate></h4>

					<app-financials-managed-account-business />

					<!--
					Business Address
					It uses the legal entity address.
				-->
					<app-financials-managed-account-address namePrefix="legal_entity.address" />
				</div>

				<!--
				Individual/Company Representative
			-->
				<h4>
					<template v-if="account.type === 'individual'">
						<translate>Your Details</translate>
					</template>
					<template v-else-if="account.type === 'company'">
						<translate>Representative Details</translate>
					</template>
				</h4>

				<div class="alert" v-if="account.status === 'unverified'">
					<p v-if="account.type === 'individual'">
						<translate>Please fill in your personal information.</translate>
					</p>
					<p v-else-if="account.type === 'company'">
						<translate>
							We are required to collection information for a representative of your company.
						</translate>
					</p>
				</div>

				<!--
				Personal Name
			-->
				<app-financials-managed-account-name namePrefix="legal_entity" />

				<!--
				Personal DOB
			-->
				<app-financials-managed-account-dob namePrefix="legal_entity.dob" />

				<!--
				Personal Address
				Some times required for individual accounts in GB too.
			-->
				<app-financials-managed-account-address
					:namePrefix="
						account.type === 'company' ? 'legal_entity.personal_address' : 'legal_entity.address'
					"
				/>

				<!--
				SSN
			-->
				<app-financials-managed-account-ssn
					namePrefix="legal_entity"
					:countryCode="account.country_code"
				/>

				<!--
				Personal ID Verification
			-->
				<app-financials-managed-account-id-document
					ref="id-document"
					namePrefix="legal_entity.verification"
				/>

				<!--
				Additional Owners (for Europe)
				Anyone that owns at least 25% of the company needs to be listed.
			-->
				<div
					v-if="
						(requiresField('legal_entity.additional_owners') && account.status === 'unverified') ||
							formModel.additional_owners_count > 0
					"
				>
					<h4><translate>Additional Owners</translate></h4>

					<div class="alert">
						<p>
							<translate>
								In Single Euro Payments Area member countries, we are required to collect and verify
								information about anybody that owns at least 25% of the company, in addition to the
								representative.
							</translate>
							<a href="https://en.wikipedia.org/wiki/Single_Euro_Payments_Area" target="_blank">
								<translate>Learn more</translate>
							</a>
						</p>
					</div>

					<!-- Funny syntax for zero based v-for iteration -->
					<div v-for="(_, i) in formModel.additional_owners_count" :key="i">
						<!--
							We only use this when gathering info for the additional owner.
							It's pointless after they've filled out all the owners.
						-->
						<h5 class="clearfix" v-if="account.status === 'unverified'">
							<div class="pull-right">
								<app-button
									v-if="
										getStripeField(`legal_entity.additional_owners.${i}.verification.status`) !==
											'verified'
									"
									sparse
									icon="remove"
									@click.prevent="removeAdditionalOwner(i)"
								/>
							</div>

							<span>
								{{ formModel['legal_entity.additional_owners.' + i + '.first_name'] | uppercase }}
								{{ formModel['legal_entity.additional_owners.' + i + '.last_name'] | uppercase }}
							</span>
						</h5>

						<!--
						These are the only fields we need to collect according to Stripe.
					-->
						<app-financials-managed-account-name
							:namePrefix="`legal_entity.additional_owners.${i}`"
							:forceRequired="true"
						/>

						<app-financials-managed-account-dob
							:namePrefix="`legal_entity.additional_owners.${i}.dob`"
							:forceRequired="true"
						/>

						<app-financials-managed-account-address
							:namePrefix="`legal_entity.additional_owners.${i}.address`"
							:forceRequired="true"
						/>

						<app-financials-managed-account-id-document
							:ref="`additional-id-document-${i}`"
							:namePrefix="`legal_entity.additional_owners.${i}.verification`"
						/>
					</div>

					<!-- Add additional owner -->
					<div class="clearfix">
						<div class="pull-right" v-if="formModel.additional_owners_count <= 3">
							<app-button @click.prevent="addAdditionalOwner()">
								<translate>Add Additional Owner</translate>
							</app-button>
						</div>
					</div>

					<hr />
				</div>

				<!--<div v-if="false">
				<legend>Bank Account</legend>
				<div v-if="stripe.current.external_accounts.total_count >= 1">
					<p><strong>Account Holder</strong>: {{ stripe.current.external_accounts.data[0].account_holder_name }}</p>
					<p><strong>Account Type</strong>: {{ stripe.current.external_accounts.data[0].account_holder_type | uppercase }}</p>
					<p><strong>Bank Name</strong>: {{ stripe.current.external_accounts.data[0].bank_name }}</p>
					<p><strong>Country</strong>: {{ stripe.current.external_accounts.data[0].country }}</p>
					<p><strong>Account Number (last 4)</strong>: {{ stripe.current.external_accounts.data[0].last4 }}</p>
					<p><strong>Routing Number</strong>: {{ stripe.current.external_accounts.data[0].routing_number }}</p>
					<hr>
				</div>
				<div v-if="stripe.current.external_accounts.total_count === 0" >
					<div class="row">
						<div class="col-sm-6">
							<app-form-group name="bankAccount_country" label="Country">
								<select form-control="select" ng-options="code as country for (code, country) in stripe.countries" ng-change="updateCurrencies()"></select>
							</app-form-group>
						</div>
						<div class="col-sm-6">
							<app-form-group name="bankAccount_currency" label="Currency">
								<select form-control="select" ng-options="currency for (country, currency) in formState.currencies"></select>
							</app-form-group>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-6">
							<app-form-group name="bankAccount_accountNumber" label="Account Number">
								<input type="text" form-control>
								<app-form-control-errors />
							</app-form-group>
						</div>
						<div class="col-sm-6">
							<app-form-group name="bankAccount_routingNumber" label="Routing Number / Sort Code">
								<input type="text" form-control>
								<app-form-control-errors />
							</app-form-group>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-6">
							<app-form-group name="bankAccount_accountHolderName" label="Account Holder Name">
								<input type="text" form-control>
								<app-form-control-errors />
							</app-form-group>
						</div>
						<div class="col-sm-6">
							<app-form-group name="bankAccount_accountHolderType" label="Account Holder Type">
								<select form-control="select">
									<option ng-value="individual">Individual</option>
									<option ng-value="company">Company</option>
								</select>
							</app-form-group>
						</div>
					</div>
				</div>
			</div>-->
			</div>

			<!--
			There may be a specific error message, or a generic one.
		-->
			<app-expand :when="!!genericError">
				<div class="alert alert-notice">
					<p v-if="genericError !== true">{{ genericError }}</p>
					<p v-else-if="!account.is_stripe_initialized">
						<translate>
							Something went wrong. Please check that you've entered everything correctly.
						</translate>
					</p>
					<p v-else>
						<translate>
							Something went wrong. Please check that you've entered everything correctly. This is
							usually because of an invalid zip/postal code, or invalid SSN/EIN.
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
@require '~styles/variables'
@require '~styles-lib/mixins'

.form-dashboard-managed-account
	// Less spacing.
	>>> .form-horizontal
		.form-group
			margin-bottom: 10px

		.control-label
			padding-top: 0
</style>

<script lang="ts" src="./managed-account"></script>
