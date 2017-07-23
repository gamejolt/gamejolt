import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./partner-terms.html';
import { UserStripeManagedAccount } from '../../../../../lib/gj-lib-client/components/user/stripe-managed-account/stripe-managed-account';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';

@View
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
export class AppPartnerTerms extends Vue {
	@Prop(UserStripeManagedAccount) account: UserStripeManagedAccount;

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
