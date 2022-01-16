<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { html } from '../../../../../lib/terms/distribution-agreement/global.md';
import { formatDate } from '../../../../../_common/filters/date';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { UserStripeManagedAccount } from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppDeveloperTerms extends Vue {
	@Prop(Object) account!: UserStripeManagedAccount;

	checked = false;
	showAgreement = false;
	termsTemplate = html;

	readonly formatDate = formatDate;

	@Emit('accepted')
	emitAccepted() {}

	get shouldShowAgreement() {
		return (
			(!this.hasSignedSomeAgreement || this.showAgreement) &&
			!this.hasSignedLatestDeveloperAgreement
		);
	}

	get hasSignedDeveloperAgreement() {
		return this.account && this.account.tos_signed_developer > 0;
	}

	get hasSignedLatestDeveloperAgreement() {
		return (
			this.account &&
			this.account.tos_signed_developer ===
				UserStripeManagedAccount.TERMS_DISTRIBUTION_VERSION
		);
	}

	get hasSignedOldDeveloperAgreement() {
		return (
			this.account &&
			this.account.tos_signed_developer > 0 &&
			this.account.tos_signed_developer !==
				UserStripeManagedAccount.TERMS_DISTRIBUTION_VERSION
		);
	}

	get hasSignedSomeAgreement() {
		return (
			this.account &&
			(this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0)
		);
	}

	get agreementLink() {
		if (this.hasSignedOldDeveloperAgreement) {
			return 'https://github.com/gamejolt/terms/blob/001ba00910e8ed03e880a1c0bb7a587c498dfff2/distribution-agreement/global.md';
		}
		return 'https://github.com/gamejolt/terms/blob/6306eabf457f19ae6a642af23e561b3e675aed55/distribution-agreement/global.md';
	}

	get agreementDiffLink() {
		return 'https://github.com/gamejolt/terms/commit/6306eabf457f19ae6a642af23e561b3e675aed55?diff=unified&amp;short_path=884d38f#diff-884d38fc8fdab64ff118865dab13fa74';
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
				v-if="hasSignedDeveloperAgreement"
				v-app-tooltip="$gettext(`You have completed this section.`)"
				class="pull-right done-icon"
			>
				<app-jolticon icon="check" big />
			</span>
			<translate>Developer Distribution Agreement</translate>
		</legend>

		<div v-if="hasSignedDeveloperAgreement" class="form-group">
			<p class="small">
				<translate
					:translate-params="{
						date: formatDate(account.tos_signed_developer_timestamp, 'medium'),
					}"
				>
					You have agreed to our Distribution Agreement on %{ date }.
				</translate>
				<br />
				<app-link-external :href="agreementLink">
					<translate>View Distribution Agreement</translate>
				</app-link-external>
			</p>
		</div>
		<div v-else>
			<!--
				If they accepted a different agreement, then show that they can accept this one too.
			-->
			<div v-if="hasSignedSomeAgreement" class="form-group">
				<div class="small">
					<div>
						<translate>
							If you would like to sell games on the Marketplace, you must accept the
							Distribution Agreement.
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

		<div v-if="hasSignedOldDeveloperAgreement" class="form-group">
			<div class="alert alert-notice">
				<translate>
					You have signed an older version of the Distribution Agreement. To be able to
					include your games in the Partner Program you must accept the new agreement.
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
			<div v-if="showAgreement" class="alert">
				<p>
					<translate>We publicly track and version all of our terms.</translate>
					<app-link-external :href="agreementDiffLink">
						<translate>
							See the "diff" between the version you signed previously and the current
							version.
						</translate>
					</app-link-external>
				</p>
			</div>
		</div>

		<div v-if="shouldShowAgreement" class="form-group">
			<div class="tos-scroller">
				<div v-html="termsTemplate" />
			</div>
			<br />

			<div class="checkbox">
				<label>
					<input v-model="checked" type="checkbox" />
					<translate>
						By checking this box and clicking the button below marked "I Agree," I agree
						that I have read, understand, and agree to be bound by the terms of this
						agreement.
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
