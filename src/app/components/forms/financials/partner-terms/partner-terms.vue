<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { html } from '../../../../../lib/terms/partner/global.md';
import { formatDate } from '../../../../../_common/filters/date';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { UserStripeManagedAccount } from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppPartnerTerms extends Vue {
	@Prop(Object) account!: UserStripeManagedAccount;

	checked = false;
	showAgreement = false;
	termsTemplate = html;

	readonly formatDate = formatDate;

	@Emit('accepted')
	emitAccepted() {}

	get hasSignedPartnerAgreement() {
		return this.account && this.account.tos_signed_partner > 0;
	}

	get hasSignedSomeAgreement() {
		return (
			this.account &&
			(this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0)
		);
	}

	get agreementLink() {
		return 'https://github.com/gamejolt/terms/blob/0371c397b84ac1f10c911de52384a5a727dc9f15/partner/global.md';
	}

	onAccept() {
		this.emitAccepted();
	}
}
</script>

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
						date: formatDate(account.tos_signed_partner_timestamp, 'medium'),
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
