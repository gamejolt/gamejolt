import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./videos.html';

import { CommentVideo } from '../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppCommentVideoThumbnail } from '../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

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
export default class RouteProfileVideos extends BaseRouteComponent {
	@Prop() user: User;
	@Prop() videosCount: number;

	videos: CommentVideo[] = [];
	page = 0;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/profile/videos/@' + route.params.username);
	}

	routed() {
		Meta.title = `Videos from ${this.user.display_name} (@${this.user.username})`;

		this.videos = CommentVideo.populate(this.$payload.videos);
	}

	async loadMore() {
		++this.page;

		const response = await Api.sendRequest(
			`/web/profile/videos/@${this.user.username}?page=${this.page}`
		);
		this.videos = this.videos.concat(CommentVideo.populate(response.videos));
	}
}
