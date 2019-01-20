import View from '!view!./view.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppCommunityJoinWidget } from 'game-jolt-frontend-lib/components/community/join-widget/join-widget';
import { AppCommunityThumbnailImg } from 'game-jolt-frontend-lib/components/community/thumbnail/img/img';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteCommunitiesView',
	components: {
		AppPageHeader,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
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

	community: Community = null as any;
	collaboratorInvite: Collaborator | null = null;
	tags: string[] = [];
	unreadWatermark = 0;

	routeResolved($payload: any) {
		this.community = new Community($payload.community);
		if ($payload.invite) {
			this.collaboratorInvite = new Collaborator($payload.invite);
		}
		this.tags = $payload.tags || [];
		if ($payload.unreadWatermark) {
			this.unreadWatermark = $payload.unreadWatermark;
		}

		this.setPageTheme(this.community.theme || null);
		this.viewCommunity(this.community);
	}

	routeDestroyed() {
		this.setPageTheme(null);
	}

	async acceptCollaboration() {
		await this.collaboratorInvite!.$accept();
		this.community.perms = this.collaboratorInvite!.perms;
		this.collaboratorInvite = null;
	}

	async declineCollaboration() {
		await this.collaboratorInvite!.$remove();
		this.collaboratorInvite = null;
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
}
