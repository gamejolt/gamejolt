import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../_common/filters/date';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { UserStripeManagedAccount } from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppPartnerTerms extends Vue {
	@Prop(UserStripeManagedAccount) account!: UserStripeManagedAccount;

	checked = false;
	showAgreement = false;
	termsTemplate: string = require('../../../../../lib/terms/partner/global.md');

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
