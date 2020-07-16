import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { ThemeState, ThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store';
import { AppCommunityPerms } from '../../../community/perms/perms';
import AppShellCbarItem from '../item/item.vue';

@Component({
	components: {
		AppShellCbarItem,
		AppCommunityThumbnailImg,
		AppPopper,
		AppCommunityPerms,
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarCommunity extends Vue {
	@Prop(Community) community!: Community;

	@AppState user!: AppStore['user'];
	@ThemeState userTheme!: ThemeStore['userTheme'];
	@State grid!: Store['grid'];
	@State communityStates!: Store['communityStates'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];
	@Action leaveCommunity!: Store['leaveCommunity'];

	popperVisible = false;

	readonly Environment = Environment;

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get isUnread() {
		return this.communityState.isUnread;
	}

	get featureCount() {
		return this.communityState.unreadFeatureCount;
	}

	get isActive() {
		return (
			this.$route.name &&
			this.$route.name.indexOf('communities.view') === 0 &&
			this.$route.params.path === this.community!.path &&
			(!this.visibleLeftPane || this.visibleLeftPane === 'context')
		);
	}

	get highlight() {
		if (this.isActive) {
			const theme = this.community.theme || this.userTheme;
			if (theme) {
				return '#' + theme.highlight_;
			}
		}
		return null;
	}

	get tooltip() {
		// Don't show the tooltip if the right click popper is visible.
		return this.popperVisible ? '' : this.community.name;
	}

	get shouldShowModerate() {
		return this.user && this.user.isMod;
	}

	get shouldShowLeave() {
		return !this.community.hasPerms();
	}

	async onLeaveCommunityClick() {
		Popper.hideAll();
		await this.leaveCommunity(this.community);
	}

	onCommunityClick() {
		if (this.$route.params.path === this.community.path) {
			this.toggleLeftPane('context');
		}
	}

	gotoModerate() {
		Popper.hideAll();
		Navigate.newWindow(Environment.baseUrl + `/moderate/communities/view/${this.community.id}`);
	}
}
