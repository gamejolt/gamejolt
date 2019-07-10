<template>
	<fieldset>
		<legend>
			<span
				v-if="hasSignedDeveloperAgreement"
				class="pull-right done-icon"
				v-app-tooltip="$gettext(`You have completed this section.`)"
			>
				<app-jolticon icon="check" big />
			</span>
			<translate>Developer Distribution Agreement</translate>
		</legend>

		<div class="form-group" v-if="hasSignedDeveloperAgreement">
			<p class="small">
				<translate
					:translate-params="{
						date: date(account.tos_signed_developer_timestamp, 'medium'),
					}"
				>
					You have agreed to our Distribution Agreement on %{ date }.
				</translate>
				<br />
				<external-link :href="agreementLink">
					<translate>View Distribution Agreement</translate>
				</external-link>
			</p>
		</div>
		<div v-else>
			<!--
				If they accepted a different agreement, then show that they can accept this one too.
			-->
			<div class="form-group" v-if="hasSignedSomeAgreement">
				<div class="small">
					<div>
						<translate>
							If you would like to sell games on the Marketplace, you must accept the Distribution
							Agreement.
						</translate>
					</div>
					<div>
						<router-link class="link-help" :to="{ name: 'landing.marketplace' }">
							<translate>Learn more</translate>
						</router-link>
					</div>
				</div>
				<br />

				<app-button v-if="!showAgreement" primary @click="showAgreement = true">
					<translate>Show Developer Distribution Agreement</translate>
				</app-button>
			</div>
		</div>

		<div class="form-group" v-if="hasSignedOldDeveloperAgreement">
			<div class="alert alert-notice">
				<translate>
					You have signed an older version of the Distribution Agreement. To be able to include your
					games in the Partner Program you must accept the new agreement.
				</translate>
				<router-link :to="{ name: 'landing.partners' }">
					<translate>Learn more about the Partner Program</translate>
				</router-link>
			</div>

			<app-button v-if="!showAgreement" primary @click="showAgreement = true">
				<translate>Show New Distribution Agreement</translate>
			</app-button>

			<!--
				Show a diff between the terms.
			-->
			<div class="alert" v-if="showAgreement">
				<p>
					<translate>We publicly track and version all of our terms.</translate>
					<external-link :href="agreementDiffLink">
						<translate>
							See the "diff" between the version you signed previously and the current version.
						</translate>
					</external-link>
				</p>
			</div>
		</div>

		<div class="form-group" v-if="shouldShowAgreement">
			<div class="tos-scroller">
				<div v-html="termsTemplate"></div>
			</div>
			<br />

			<div class="checkbox">
				<label>
					<input type="checkbox" v-model="checked" />
					<translate>
						By checking this box and clicking the button below marked "I Agree," I agree that I have
						read, understand, and agree to be bound by the terms of this agreement.
					</translate>
				</label>
			</div>
			<br />

			<app-button primary solid :disabled="!checked" @click="onAccept()">
				<translate>I Agree</translate>
			</app-button>
		</div>
	</fieldset>
</template>

<script lang="ts" src="./developer-terms"></script>
