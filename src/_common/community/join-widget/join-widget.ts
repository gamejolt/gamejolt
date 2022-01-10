import { Options, Prop, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { GridClient } from '../../../app/components/grid/client.service';
import { Store } from '../../../app/store';
import { CommunityJoinLocation } from '../../analytics/analytics.service';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { AppStore } from '../../store/app-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Community } from '../community.model';

@Options({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppCommunityJoinWidget extends Vue {
	@Prop({ type: Community, required: true })
	community!: Community;

	@Prop({ type: String, required: true })
	location!: CommunityJoinLocation;

	@Prop({ type: Boolean, required: false, default: false })
	block?: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hideCount?: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	solid?: boolean;

	@State app!: AppStore;
	@State grid!: GridClient;
	@Action joinCommunity!: Store['joinCommunity'];
	@Action leaveCommunity!: Store['leaveCommunity'];

	isProcessing = false;

	get badge() {
		return !this.hideCount && this.community.member_count
			? formatNumber(this.community.member_count)
			: '';
	}

	get canJoin() {
		// Guests should always be allowed to attempt to join stuff.
		// When they log in, we can check if they are actually allowed.
		return !this.app.user || !!this.app.user.can_join_communities;
	}

	get isDisabled() {
		if (this.isProcessing) {
			return true;
		}

		// Always allow users to leave a community
		if (this.community.is_member) {
			return false;
		}

		return !this.canJoin;
	}

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.community.is_member) {
			try {
				await this.joinCommunity({ community: this.community, location: this.location });
			} catch (e) {
				console.log(e);
				let message = this.$gettext(
					`Something has prevented you from joining this community.`
				);
				if (e.errors && e.errors['limit-reached']) {
					message = this.$gettext(`You already joined too many communities!`);
				}

				showErrorGrowl(message);
			}
		} else {
			try {
				await this.leaveCommunity({
					community: this.community,
					location: this.location,
					shouldConfirm: true,
				});
			} catch (e) {
				showErrorGrowl(this.$gettext(`For some reason we couldn't leave this community.`));
			}
		}

		this.isProcessing = false;
	}
}
