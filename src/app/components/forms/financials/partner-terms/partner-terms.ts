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
export default class AppPartnerTerms extends Vue {
	@Prop(UserStripeManagedAccount) account!: UserStripeManagedAccount;

	checked = false;
	showAgreement = false;
	termsTemplate: string = require('../../../../../lib/terms/partner/global.md');

	readonly date = date;

	get hasSignedPartnerAgreement() {
		return this.account && this.account.tos_signed_partner > 0;
	}

	get hasSignedSomeAgreement() {
		return (
			this.account && (this.account.tos_signed_developer > 0 || this.account.tos_signed_partner > 0)
		);
	}

	get agreementLink() {
		return 'https://github.com/gamejolt/terms/blob/0371c397b84ac1f10c911de52384a5a727dc9f15/partner/global.md';
	}

	onAccept() {
		this.$emit('accepted');
	}
}
