import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../_common/api/api.service';
import AppCommentVideoThumbnail from '../../../../_common/comment/video/thumbnail/thumbnail.vue';
import { CommentVideo } from '../../../../_common/comment/video/video-model';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../profile.store';

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
