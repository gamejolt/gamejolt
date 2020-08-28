import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { GridClient } from '../../../app/components/grid/client.service';
import { Store } from '../../../app/store';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { number } from '../../filters/number';
import { Growls } from '../../growls/growls.service';
import { AppStore } from '../../store/app-store';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { $joinCommunity, $leaveCommunity, Community } from '../community.model';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppCommunityJoinWidget extends Vue {
	@Prop(Community) community!: Community;
	@Prop(Boolean) block?: boolean;
	@Prop(Boolean) hideCount?: boolean;
	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;
	@Prop(Boolean) solid?: boolean;

	@State app!: AppStore;
	@State grid!: GridClient;
	@Action joinCommunity!: Store['joinCommunity'];
	@Action leaveCommunity!: Store['leaveCommunity'];

	isProcessing = false;

	get badge() {
		return !this.hideCount && this.community.member_count
			? number(this.community.member_count)
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
				await $joinCommunity(this.community);
				this.joinCommunity(this.community);
			} catch (e) {
				console.log(e);
				let message = this.$gettext(
					`Something has prevented you from joining this community.`
				);
				if (e.errors && e.errors['limit-reached']) {
					message = this.$gettext(`You already joined too many communities!`);
				}

				Growls.error(message);
			}
		} else {
			try {
				await $leaveCommunity(this.community);
				this.leaveCommunity(this.community);
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't leave this community.`));
			}
		}

		this.isProcessing = false;
	}
}
