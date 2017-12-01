import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list.html';

import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { AppCommentVideoThumbnail } from '../../../../../lib/gj-lib-client/components/comment/video/thumbnail/thumbnail';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

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
	@Prop() user: User;
	@Prop() videosCount: number;

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
		this.videos = CommentVideo.populate($payload.videos);
	}

	async loadMore() {
		++this.page;

		const response = await Api.sendRequest(
			`/web/profile/videos/@${this.user.username}?page=${this.page}`
		);
		this.videos = this.videos.concat(CommentVideo.populate(response.videos));
	}
}
