import View from '!view!./list.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppCommentVideoThumbnail } from 'game-jolt-frontend-lib/components/comment/video/thumbnail/thumbnail';
import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../../profile.store';

@View
@Component({
	name: 'RouteProfileVideosList',
	components: {
		AppCommentVideoThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteProfileVideosList extends BaseRouteComponent {
	@RouteState
	user!: RouteStore['user'];

	@RouteState
	videosCount!: RouteStore['videosCount'];

	videos: CommentVideo[] = [];
	page = 0;

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/profile/videos/@' + route.params.username);
	}

	get routeTitle() {
		if (this.user) {
			return `Videos from ${this.user.display_name} (@${this.user.username})`;
		}
		return null;
	}

	routed($payload: any) {
		this.page = 0;
		this.videos = CommentVideo.populate($payload.videos);
	}

	async loadMore() {
		if (!this.user) {
			return;
		}

		++this.page;

		const response = await Api.sendRequest(
			`/web/profile/videos/@${this.user.username}?page=${this.page}`
		);
		this.videos = this.videos.concat(CommentVideo.populate(response.videos));
	}
}
