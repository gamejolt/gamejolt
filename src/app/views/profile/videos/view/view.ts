import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./view.html?style=./view.styl';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppResponsiveDimensions } from '../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Comment } from '../../../../../lib/gj-lib-client/components/comment/comment-model';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppCommentWidgetLazy } from '../../../../components/lazy';
import { AppFiresidePostLikeWidget } from '../../../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { AppGameThumbnail } from '../../../../components/game/thumbnail/thumbnail';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppUserFollowWidget } from '../../../../components/user/follow-widget/follow-widget';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppScrollWhen } from '../../../../../lib/gj-lib-client/components/scroll/scroll-when.directive.vue';

@View
@Component({
	name: 'RouteProfileVideosView',
	components: {
		AppResponsiveDimensions,
		AppVideoEmbed,
		AppFadeCollapse,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppGameThumbnail,
		AppUserAvatar,
		AppUserFollowWidget,
	},
	directives: {
		AppTrackEvent,
		AppScrollWhen,
	},
})
export default class RouteProfileVideosView extends BaseRouteComponent {
	@Prop(User) user: User;

	post: FiresidePost = null as any;
	video: CommentVideo = null as any;
	comment: Comment = null as any;
	game: Game = null as any;

	commentsCount = 0;
	canToggleDescription = false;
	showFullDescription = true;

	Screen = makeObservableService(Screen);

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/fireside/post/' + route.params.postHash);
	}

	routed() {
		this.post = new FiresidePost(this.$payload.post);
		this.video = this.post.comment_video!;
		this.comment = this.video.comment;
		this.game = this.video.game;
	}

	updateCommentsCount(count: number) {
		this.commentsCount = count;
	}
}
