import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserStripeManagedAccount } from 'game-jolt-frontend-lib/components/user/stripe-managed-account/stripe-managed-account';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		date,
	},
})
export default class AppDeveloperTerms extends Vue {
	@Prop(UserStripeManagedAccount) account!: UserStripeManagedAccount;

	checked = false;
	showAgreement = false;
	termsTemplate: string = require('../../../../../lib/terms/distribution-agreement/global.md');

	readonly date = date;

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
			this.account.tos_signed_developer === UserStripeManagedAccount.TERMS_DISTRIBUTION_VERSION
		);
	}

	get hasSignedOldDeveloperAgreement() {
		return (
			this.account &&
			this.account.tos_signed_developer > 0 &&
			this.account.tos_signed_developer !== UserStripeManagedAccount.TERMS_DISTRIBUTION_VERSION
		);
	}

	get hasSignedSomeAgreement() {
		return (
			this.account && (this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0)
		);
	}

	get agreementLink() {
		if (this.hasSignedOldDeveloperAgreement) {
			return 'https://github.com/gamejolt/terms/blob/001ba00910e8ed03e880a1c0bb7a587c498dfff2/distribution-agreement/global.md';
		}
		return 'https://github.com/gamejolt/terms/blob/6306eabf457f19ae6a642af23e561b3e675aed55/distribution-agreement/global.md';
	}

	get agreementDiffLink() {
		// tslint:disable-next-line:max-line-length
		return 'https://github.com/gamejolt/terms/commit/6306eabf457f19ae6a642af23e561b3e675aed55?diff=unified&amp;short_path=884d38f#diff-884d38fc8fdab64ff118865dab13fa74';
	}

	onAccept() {
		this.$emit('accepted');
	}
}
