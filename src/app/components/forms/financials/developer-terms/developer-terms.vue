<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { html } from '../../../../../lib/terms/distribution-agreement/global.md';
import { formatDate } from '../../../../../_common/filters/date';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { UserStripeManagedAccount } from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
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
				<AppJolticon icon="check" big />
			</span>
			<AppTranslate>Developer Distribution Agreement</AppTranslate>
		</legend>

		<div v-if="hasSignedDeveloperAgreement" class="form-group">
			<p class="small">
				<AppTranslate
					:translate-params="{
						date: formatDate(account.tos_signed_developer_timestamp, 'medium'),
					}"
				>
					You have agreed to our Distribution Agreement on %{ date }.
				</AppTranslate>
				<br />
				<AppLinkExternal :href="agreementLink">
					<AppTranslate>View Distribution Agreement</AppTranslate>
				</AppLinkExternal>
			</p>
		</div>
		<div v-else>
			<!--
				If they accepted a different agreement, then show that they can accept this one too.
			-->
			<div v-if="hasSignedSomeAgreement" class="form-group">
				<div class="small">
					<div>
						<AppTranslate>
							If you would like to sell games on the Marketplace, you must accept the
							Distribution Agreement.
						</AppTranslate>
					</div>
					<div>
						<router-link class="link-help" :to="{ name: 'landing.marketplace' }">
							<AppTranslate>Learn more</AppTranslate>
						</router-link>
					</div>
				</div>
				<br />

				<AppButton v-if="!showAgreement" primary @click="showAgreement = true">
					<AppTranslate>Show Developer Distribution Agreement</AppTranslate>
				</AppButton>
			</div>
		</div>

		<div v-if="hasSignedOldDeveloperAgreement" class="form-group">
			<div class="alert alert-notice">
				<AppTranslate>
					You have signed an older version of the Distribution Agreement. To be able to
					include your games in the Partner Program you must accept the new agreement.
				</AppTranslate>
				<router-link :to="{ name: 'landing.partners' }">
					<AppTranslate>Learn more about the Partner Program</AppTranslate>
				</router-link>
			</div>

			<AppButton v-if="!showAgreement" primary @click="showAgreement = true">
				<AppTranslate>Show New Distribution Agreement</AppTranslate>
			</AppButton>

			<!--
				Show a diff between the terms.
			-->
			<div v-if="showAgreement" class="alert">
				<p>
					<AppTranslate>We publicly track and version all of our terms.</AppTranslate>
					<AppLinkExternal :href="agreementDiffLink">
						<AppTranslate>
							See the "diff" between the version you signed previously and the current
							version.
						</AppTranslate>
					</AppLinkExternal>
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
					<AppTranslate>
						By checking this box and clicking the button below marked "I Agree," I agree
						that I have read, understand, and agree to be bound by the terms of this
						agreement.
					</AppTranslate>
				</label>
			</div>
			<br />

			<AppButton primary solid :disabled="!checked" @click="onAccept()">
				<AppTranslate>I Agree</AppTranslate>
			</AppButton>
		</div>
	</fieldset>
</template>
