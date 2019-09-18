import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import { Collaborator } from '../../../../_common/collaborator/collaborator.model';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityJoinWidget from '../../../../_common/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import { number } from '../../../../_common/filters/number';
import { Growls } from '../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { CommunityHeaderModal } from '../../../components/forms/community/header/modal/modal.service';
import { CommunityThumbnailModal } from '../../../components/forms/community/thumbnail/modal/modal.service';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store } from '../../../store/index';

@Component({
	name: 'RouteCommunitiesView',
	components: {
		AppPageHeader,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
		AppEditableOverlay,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	deps: { params: ['path'] },
	resolver: ({ route }) => Api.sendRequest('/web/communities/view/' + route.params.path),
})
export default class RouteCommunitiesView extends BaseRouteComponent {
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@Mutation
	joinCommunity!: Store['joinCommunity'];

	@Mutation
	leaveCommunity!: Store['leaveCommunity'];

	@Mutation
	viewCommunity!: Store['viewCommunity'];

	@State
	communityStates!: Store['communityStates'];

	community: Community = null as any;
	unreadFeaturedWatermark = 0;
	collaboratorInvite: Collaborator | null = null;

	get isEditing() {
		return this.$route.name && this.$route.name.includes('communities.view.overview.edit');
	}

	get canEditMedia() {
		return this.community.hasPerms('community-media');
	}

	routeResolved($payload: any) {
		this.community = new Community($payload.community);
		if ($payload.unreadFeaturedWatermark) {
			this.unreadFeaturedWatermark = $payload.unreadFeaturedWatermark;
		}
		if ($payload.unreadChannels) {
			const communityState = this.communityStates.getCommunityState(this.community);
			for (const channelId of $payload.unreadChannels as number[]) {
				communityState.markChannelUnread(channelId);
			}
		}
		if ($payload.invite) {
			this.collaboratorInvite = new Collaborator($payload.invite);
		}

		this.setPageTheme(this.community.theme || null);
		this.viewCommunity(this.community);
	}

	routeDestroyed() {
		this.setPageTheme(null);
	}

	onJoin() {
		this.joinCommunity(this.community);
	}

	onLeave() {
		this.leaveCommunity(this.community);
	}

	refresh() {
		this.reloadRoute();
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.community);
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
	}

	async acceptCollaboration() {
		await this.collaboratorInvite!.$accept();
		this.community.perms = this.collaboratorInvite!.perms;
		this.collaboratorInvite = null;
		Growls.success(this.$gettext(`You are now a collaborator on this community!`));
	}

	async declineCollaboration() {
		await this.collaboratorInvite!.$remove();
		this.collaboratorInvite = null;
	}
}
