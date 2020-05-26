import { Component, Provide, Watch } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { enforceLocation } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { Community, isEditingCommunity } from '../../../../_common/community/community.model';
import AppCommunityJoinWidget from '../../../../_common/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { number } from '../../../../_common/filters/number';
import AppPopper from '../../../../_common/popper/popper.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { AppCommunityPerms } from '../../../components/community/perms/perms';
import { CommunitySidebarModal } from '../../../components/community/sidebar/modal/modal.service';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { CommunityThumbnailModal } from '../../../components/forms/community/thumbnail/modal/modal.service';
import { Store } from '../../../store/index';
import { CommunityRouteStore, CommunityRouteStoreKey } from './view.store';
import AppCommunitiesViewNavEdit from './_nav-edit/nav-edit.vue';
import AppCommunitiesViewNav from './_nav/nav.vue';

@Component({
	name: 'RouteCommunitiesView',
	components: {
		AppScrollScroller,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
		AppEditableOverlay,
		AppCommunityPerms,
		AppPopper,
		AppCommunityVerifiedTick,
		AppCommunitiesViewNav,
		AppCommunitiesViewNavEdit,
		AppCommunityCard,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	deps: { params: ['path'] },
	async resolver({ route }) {
		const payload = await Api.sendRequest('/web/communities/view/' + route.params.path);

		if (payload && payload.community) {
			const redirect = enforceLocation(route, { path: payload.community.path });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
})
export default class RouteCommunitiesView extends BaseRouteComponent {
	@Provide(CommunityRouteStoreKey) routeStore = new CommunityRouteStore();

	@AppState user!: AppStore['user'];
	@ThemeMutation setPageTheme!: ThemeStore['setPageTheme'];
	@Action leaveCommunity!: Store['leaveCommunity'];
	@Mutation viewCommunity!: Store['viewCommunity'];
	@State communityStates!: Store['communityStates'];

	// community: Community = null as any;
	collaboratorInvite: Collaborator | null = null;
	// sidebarData: CommunitySidebarData | null = null;

	readonly Environment = Environment;
	readonly Screen = Screen;

	// get channel() {
	// 	return getChannelFromRoute(this.$route);
	// }

	get community() {
		return this.routeStore.community;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	// get canEditMedia() {
	// 	return this.community.hasPerms('community-media');
	// }

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	@Watch('$route', { immediate: true })
	onRouteChange() {
		this.routeStore.setChannelPathFromRoute(this.$route);
	}

	routeResolved($payload: any) {
		const { routeStore } = this;
		const community = new Community($payload.community);
		routeStore.setCommunity(community);
		routeStore.sidebarData = new CommunitySidebarData($payload);
		routeStore.collaborator = $payload.invite ? new Collaborator($payload.invite) : null;

		if ($payload.unreadChannels) {
			const communityState = this.communityStates.getCommunityState(community);

			// This flag was set to true in grid bootstrap and we need to unset it
			// now that we have the actual unread channels in this community.
			// read comment in client service for more info.
			communityState.hasUnreadPosts = false;

			for (const channelId of $payload.unreadChannels as number[]) {
				communityState.markChannelUnread(channelId);
			}
		}

		this.setPageTheme(community.theme || null);
		this.viewCommunity(community);
	}

	routeDestroyed() {
		this.setPageTheme(null);
	}

	onJoin() {
		// TODO
		// this.joinCommunity(this.routeStore.community);
	}

	onLeave() {
		this.leaveCommunity(this.routeStore.community);
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.routeStore.community);
	}

	copyShareUrl() {
		Clipboard.copy(
			Environment.baseUrl + this.$router.resolve(this.routeStore.community.routeLocation).href
		);
	}

	onClickAbout() {
		const { sidebarData, community } = this.routeStore;
		if (sidebarData) {
			CommunitySidebarModal.show({
				isEditing: this.isEditing,
				data: sidebarData,
				community: community,
			});
		}
	}
}
