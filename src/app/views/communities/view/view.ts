import View from '!view!./view.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppCommunityJoinWidget } from 'game-jolt-frontend-lib/components/community/join-widget/join-widget';
import { AppCommunityThumbnailImg } from 'game-jolt-frontend-lib/components/community/thumbnail/img/img';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppPageHeader } from '../../../components/page-header/page-header';

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
export default class RouteCommunitiesView extends BaseRouteComponent {
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	community: Community = null as any;

	@RouteResolve({
		cache: true,
		deps: { params: ['path'] },
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/communities/view/' + route.params.path);
	}

	routed($payload: any) {
		this.community = new Community($payload.community);
		this.setPageTheme(this.community.theme || null);
	}

	routeDestroy() {
		this.setPageTheme(null);
	}
}
