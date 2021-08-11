<script lang="ts" src="./partner-terms"></script>

<template>
	<fieldset>
		<legend>
			<span
				v-if="hasSignedPartnerAgreement"
				v-app-tooltip="$gettext(`You have completed this section.`)"
				class="pull-right done-icon"
			>
				<app-jolticon icon="check" big />
			</span>
			<translate>Partner Agreement</translate>
		</legend>

		<div v-if="!hasSignedPartnerAgreement">
			<!--
				If they accepted a different agreement, then show that they can accept this one too.
			-->
			<div v-if="hasSignedSomeAgreement && !showAgreement" class="form-group">
				<div class="small">
					<div>
						<translate>
							If you would to be a Game Jolt partner, you must accept the Partner
							Agreement.
						</translate>
					</div>
				</div>
				<br />

				<app-button primary @click="showAgreement = true">
					<translate>Show Partner Agreement</translate>
				</app-button>
			</div>

			<div v-if="!hasSignedSomeAgreement || showAgreement" class="form-group">
				<div class="tos-scroller">
					<div v-html="termsTemplate" />
				</div>
				<br />

				<div class="checkbox">
					<label>
						<input v-model="checked" type="checkbox" />
						<translate>
							By checking this box and clicking the button below marked "I Agree," I
							agree that I have read, understand, and agree to be bound by the terms
							of this agreement.
						</translate>
					</label>
				</div>
				<br />

				<app-button primary solid :disabled="!checked" @click="onAccept()">
					<translate>I Agree</translate>
				</app-button>
			</div>
		</div>

		<div v-if="hasSignedPartnerAgreement" class="form-group">
			<p class="small">
				<translate
					:translate-params="{
						date: date(account.tos_signed_partner_timestamp, 'medium'),
					}"
				>
					You have agreed to our Partner Agreement on %{ date }.
				</translate>
				<br />
				<app-link-external :href="agreementLink">
					<translate>View Partner Agreement</translate>
				</app-link-external>
			</p>
		</div>
	</fieldset>
</template>
