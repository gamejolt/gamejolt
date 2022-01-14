import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { trackGotoCommunity } from '../../../../../_common/analytics/analytics.service';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { useSidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useAppStore } from '../../../../store';
import { AppCommunityPerms } from '../../../community/perms/perms';
import AppShellCbarItem from '../item/item.vue';

@Options({
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
	@Prop({ type: Object, required: true })
	community!: Community;

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());
	sidebarStore = setup(() => useSidebarStore());

	get user() {
		return this.commonStore.user;
	}
	get activeCommunity() {
		return this.store.activeCommunity;
	}
	get communityStates() {
		return this.store.communityStates;
	}

	popperVisible = false;

	readonly Environment = Environment;

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get isUnread() {
		return this.communityState.isUnread;
	}

	get isActive() {
		return this.activeCommunity?.id === this.community.id;
	}

	get highlight() {
		if (this.isActive) {
			const theme = this.community.theme || this.themeStore.userTheme;
			if (theme) {
				return '#' + theme.darkHighlight_;
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
		return !this.community.hasPerms() && !!this.community.is_member;
	}

	get shouldShowJoin() {
		return !this.community.is_member;
	}

	async onLeaveCommunityClick() {
		Popper.hideAll();
		await this.store.leaveCommunity(this.community, 'cbar', {
			shouldConfirm: true,
		});
	}

	async onJoinCommunityClick() {
		Popper.hideAll();
		await this.store.joinCommunity(this.community, 'cbar');
	}

	onCommunityClick(event: Event) {
		if (this.isActive) {
			this.store.toggleLeftPane('context');

			// Prevent the click from triggering a route change.
			event.preventDefault();
		} else {
			this.sidebarStore.showContextOnRouteChange(true);
		}
	}

	onGotoCommunity() {
		trackGotoCommunity({ source: 'cbar', id: this.community.id, path: this.community.path });
	}

	gotoModerate() {
		Popper.hideAll();
		Navigate.newWindow(Environment.baseUrl + `/moderate/communities/view/${this.community.id}`);
	}
}
