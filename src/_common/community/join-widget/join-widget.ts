import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { GridClient } from '../../../../../app/components/grid/client.service';
import { AppTrackEvent } from '../../../components/analytics/track-event.directive';
import { AppAuthRequired } from '../../../components/auth/auth-required-directive';
import {
	$joinCommunity,
	$leaveCommunity,
	Community,
} from '../../../components/community/community.model';
import { Growls } from '../../../components/growls/growls.service';
import { findTooltipContainer } from '../../../components/tooltip/container/container';
import { AppTooltip } from '../../../components/tooltip/tooltip';
import { number } from '../../../vue/filters/number';
import { AppStore } from '../../../vue/services/app/app-store';

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

	@Prop(String)
	eventLabel?: string;

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
