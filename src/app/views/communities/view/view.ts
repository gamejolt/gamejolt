import { Component, Provide, Watch } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import { enforceLocation } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import { Community, isEditingCommunity } from '../../../../_common/community/community.model';
import AppCommunityJoinWidget from '../../../../_common/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { number } from '../../../../_common/filters/number';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import AppPopper from '../../../../_common/popper/popper.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import {
	ContextPane,
	SidebarMutation,
	SidebarState,
	SidebarStore,
} from '../../../../_common/sidebar/sidebar.store';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { AppCommunityPerms } from '../../../components/community/perms/perms';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { CommunityHeaderModal } from '../../../components/forms/community/header/modal/modal.service';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import AppShellContentWithSidebar from '../../../components/shell/content-with-sidebar/content-with-sidebar.vue';
import { Store } from '../../../store/index';
import { routeCommunitiesViewEditDetails } from './edit/details/details.route';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	setChannelPathFromRoute,
	setCommunity,
} from './view.store';
import AppCommunitiesViewCard from './_card/card.vue';
import AppCommunitiesViewContext from './_context/context.vue';
import AppEditableThumbnail from './_editable-thumbnail/editable-thumbnail.vue';
import AppNavChannels from './_nav/channels/channels.vue';

@Component({
	name: 'RouteCommunitiesView',
	components: {
		AppShellContentWithSidebar,
		AppPageHeader,
		AppPageHeaderControls,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
		AppCommunityPerms,
		AppPopper,
		AppCommunityVerifiedTick,
		AppCommunitiesViewCard,
		AppNavChannels,
		AppEditableThumbnail,
		AppEditableOverlay,
		AppMediaItemCover,
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
	@Mutation setActiveCommunity!: Store['setActiveCommunity'];
	@Mutation clearActiveCommunity!: Store['clearActiveCommunity'];
	@Mutation viewCommunity!: Store['viewCommunity'];
	@State communityStates!: Store['communityStates'];

	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@SidebarMutation addContextPane!: SidebarStore['addContextPane'];
	@SidebarMutation removeContextPane!: SidebarStore['removeContextPane'];
	@Action showContextPane!: Store['showContextPane'];

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly sidebarComponent = AppCommunitiesViewContext;

	contextPane: ContextPane | null = null;

	get community() {
		return this.routeStore.community;
	}

	get communityMemberCount() {
		return number(this.community.member_count);
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	get coverMediaItem() {
		return this.community.header || null;
	}

	get coverEditable() {
		return (
			this.isEditing &&
			this.routeStore.canEditMedia &&
			this.$route.name === routeCommunitiesViewEditDetails.name
		);
	}

	get isFrontpage() {
		return this.routeStore.channelPath === this.routeStore.frontpageChannel.title;
	}

	get isShowingHeader() {
		if (!this.coverMediaItem) {
			return false;
		}

		if (this.isFrontpage) {
			return true;
		}

		return this.isEditing && this.$route.name === routeCommunitiesViewEditDetails.name;
	}

	@Watch('$route', { immediate: true })
	onRouteChange() {
		setChannelPathFromRoute(this.routeStore, this.$route);
	}

	routeCreated() {
		// Add a new context pane if we haven't already.
		if (!this.contextPane) {
			this.addContextPane(this.sidebarComponent);
			this.contextPane = this.activeContextPane;
		}

		// Assign the props required for 'this.sidebarComponent'.
		if (this.contextPane) {
			this.contextPane.props = { routeStore: this.routeStore };
		}
	}

	routeResolved($payload: any) {
		const { routeStore } = this;
		const community = new Community($payload.community);
		setCommunity(routeStore, community);
		routeStore.sidebarData = new CommunitySidebarData($payload);
		routeStore.collaborator = $payload.invite ? new Collaborator($payload.invite) : null;

		if ($payload.unreadChannels) {
			const communityState = this.communityStates.getCommunityState(community);

			// This flag was set to true in grid bootstrap and we need to unset it
			// now that we have the actual unread channels in this community.
			// read comment in client service for more info.
			communityState.hasUnreadPosts = false;
			communityState.routeBootstrapped = true;

			for (const channelId of $payload.unreadChannels as number[]) {
				communityState.markChannelUnread(channelId);
			}
		}

		this.setActiveCommunity(community);
		this.setPageTheme(community.theme || null);
		this.viewCommunity(community);
	}

	routeDestroyed() {
		this.removeContextPane(this.contextPane);
		this.clearActiveCommunity();
		this.setPageTheme(null);
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
	}

	copyShareUrl() {
		Clipboard.copy(
			Environment.baseUrl + this.$router.resolve(this.routeStore.community.routeLocation).href
		);
	}
}
