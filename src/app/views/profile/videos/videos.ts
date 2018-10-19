import View from '!view!./videos.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { AppCommentVideoThumbnail } from 'game-jolt-frontend-lib/components/comment/video/thumbnail/thumbnail';
import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../profile.store';

@View
@Component({
	name: 'RouteProfileVideos',
	components: {
		AppCommentVideoThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/profile/videos/@' + route.params.username),
})
export default class RouteProfileVideos extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	videosCount!: RouteStore['videosCount'];

	videos: CommentVideo[] = [];
	page = 0;

	get routeTitle() {
		if (this.user) {
			return `Videos from ${this.user.display_name} (@${this.user.username})`;
		}
		return null;
	}

	routeResolved($payload: any) {
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
