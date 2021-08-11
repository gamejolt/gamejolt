import { Component, Inject, Provide, Watch } from 'vue-property-decorator';
import { Action, Mutation, State } from 'vuex-class';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../../utils/mobile-app';
import { enforceLocation, getShareableLink } from '../../../../utils/router';
import { trackShareLink } from '../../../../_common/analytics/analytics.service';
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
import { AppCommunityPerms } from '../../../components/community/perms/perms';
import { CommunitySidebarData } from '../../../components/community/sidebar/sidebar-data';
import { CommunityHeaderModal } from '../../../components/forms/community/header/modal/modal.service';
import AppPageHeaderControls from '../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import AppShellContentWithSidebar from '../../../components/shell/content-with-sidebar/content-with-sidebar.vue';
import { store, Store, tillGridBootstrapped } from '../../../store/index';
import { routeCommunitiesViewEditDetails } from './edit/details/details.route';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	setChannelPathFromRoute,
	setCommunity,
} from './view.store';
import AppCommunitiesViewContext from './_context/context.vue';
import AppEditableThumbnail from './_editable-thumbnail/editable-thumbnail.vue';
import AppMobileHeader from './_mobile-header/mobile-header.vue';
import AppNavChannels from './_nav/channels/channels.vue';

export const CommunityThemeKey = 'community';

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
		AppMobileHeader,
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
	@Inject(AppPromotionStoreKey) appPromotion!: AppPromotionStore;

	@AppState user!: AppStore['user'];
	@Mutation setActiveCommunity!: Store['setActiveCommunity'];
	@Mutation clearActiveCommunity!: Store['clearActiveCommunity'];
	@Mutation viewCommunity!: Store['viewCommunity'];
	@State communityStates!: Store['communityStates'];
	@State grid!: Store['grid'];

	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@SidebarMutation addContextPane!: SidebarStore['addContextPane'];
	@SidebarMutation removeContextPane!: SidebarStore['removeContextPane'];
	@Action showContextPane!: Store['showContextPane'];

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly sidebarComponent = AppCommunitiesViewContext;

	contextPane: ContextPane | null = null;

	get hasUnreadPosts() {
		return this.communityStates.getCommunityState(this.community).isUnread;
	}

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

	get competitionHeader() {
		return this.routeStore.channel?.competition?.header ?? null;
	}

	get coverMediaItem() {
		return this.competitionHeader ?? this.community.header ?? null;
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
		if (this.routeStore.channel?.type === 'competition') {
			return !!this.competitionHeader && !this.isEditing;
		}

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

		setAppPromotionCohort(this.appPromotion, 'community');
	}

	routeResolved($payload: any) {
		const { routeStore } = this;
		const community = new Community($payload.community);

		setCommunity(routeStore, community);
		routeStore.sidebarData = new CommunitySidebarData($payload);
		routeStore.collaborator = $payload.invite ? new Collaborator($payload.invite) : null;

		this.setActiveCommunity(community);
		this.viewCommunity(community);
		this.setPageTheme();

		if (this.user && community.is_member) {
			this.getCommunityBootstrap();
		}
	}

	private async getCommunityBootstrap() {
		// When this is the first route the user enters, grid might not be bootstrapped yet.
		const grid = await tillGridBootstrapped();
		grid.queueRequestCommunityBootstrap(this.community.id);
	}

	routeDestroyed() {
		this.removeContextPane(this.contextPane);
		this.clearActiveCommunity();
		store.commit('theme/clearPageTheme', CommunityThemeKey);
		if (this.grid) {
			this.grid.deregisterViewingCommunity(this.community.id);
		}
	}

	private setPageTheme() {
		const theme = this.community?.theme ?? null;
		store.commit('theme/setPageTheme', { key: CommunityThemeKey, theme });
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
	}

	copyShareUrl() {
		const url = getShareableLink(this.$router, this.community.routeLocation);
		Clipboard.copy(url);
		trackShareLink({ url });
	}
}
