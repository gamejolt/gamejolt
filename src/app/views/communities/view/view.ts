import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityJoinWidget from 'game-jolt-frontend-lib/components/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue';
import AppEditableOverlay from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay.vue';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
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
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@Mutation
	joinCommunity!: Store['joinCommunity'];

	@Mutation
	leaveCommunity!: Store['leaveCommunity'];

	@Mutation
	viewCommunity!: Store['viewCommunity'];

	community: Community = null as any;
	unreadWatermark = 0;
	collaboratorInvite: Collaborator | null = null;

	get isEditing() {
		// return this.$route.name && this.$route.name.includes('communities.view.edit');
		return this.$route.name && this.$route.name.includes('communities.view.overview.edit');
	}

	get canEditMedia() {
		return this.community.hasPerms('community-media');
	}

	routeResolved($payload: any) {
		this.community = new Community($payload.community);
		if ($payload.unreadWatermark) {
			this.unreadWatermark = $payload.unreadWatermark;
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
