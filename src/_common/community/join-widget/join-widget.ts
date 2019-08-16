import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { GridClient } from '../../../app/components/grid/client.service';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { number } from '../../filters/number';
import { Growls } from '../../growls/growls.service';
import { AppStore } from '../../store/app-store';
import { findTooltipContainer } from '../../tooltip/container/container';
import { AppTooltip } from '../../tooltip/tooltip';
import { $joinCommunity, $leaveCommunity, Community } from '../community.model';

@Component({
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
})
export default class AppCommunityJoinWidget extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@State
	app!: AppStore;

	@State
	grid!: GridClient;

	isProcessing = false;

	@Emit('join')
	join(_community: Community) {}

	@Emit('leave')
	leave(_community: Community) {}

	get badge() {
		return !this.hideCount && this.community.member_count
			? number(this.community.member_count)
			: '';
	}

	get tooltipContainer() {
		return findTooltipContainer(this);
	}

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.community.is_member) {
			try {
				await $joinCommunity(this.community);
				this.grid.joinCommunity(this.community);
				this.join(this.community);
			} catch (e) {
				Growls.error(
					this.$gettext(`Something has prevented you from joining this community.`)
				);
			}
		} else {
			try {
				await $leaveCommunity(this.community);
				this.grid.leaveCommunity(this.community);
				this.leave(this.community);
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't leave this community.`));
			}
		}

		this.isProcessing = false;
	}
}
