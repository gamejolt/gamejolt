import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityJoinWidget from 'game-jolt-frontend-lib/components/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store } from '../../../store/index';

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

	get isEditing() {
		return this.$route.name && this.$route.name.includes('communities.view.edit');
	}

	routeResolved($payload: any) {
		this.community = new Community($payload.community);
		if ($payload.unreadWatermark) {
			this.unreadWatermark = $payload.unreadWatermark;
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
}
