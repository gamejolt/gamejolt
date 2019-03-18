import View from '!view!./view.html';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { HistoryTick } from '../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { AppMessageThreadAdd } from '../../../../../lib/gj-lib-client/components/message-thread/add/add';
import { AppMessageThreadPagination } from '../../../../../lib/gj-lib-client/components/message-thread/pagination/pagination';
import { AppPopper } from '../../../../../lib/gj-lib-client/components/popper/popper';
import { ReportModal } from '../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollAffix } from '../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppScrollTo } from '../../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { enforceLocation } from '../../../../../lib/gj-lib-client/utils/router';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { FormForumPost } from '../../../../components/forms/forum/post/post';
import { FormForumTopic } from '../../../../components/forms/forum/topic/topic';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { AppForumPostList } from '../../../../components/forum/post-list/post-list';
import { AppForumTopicUpvoteWidget } from '../../../../components/forum/topic/upvote-widget/upvote-widget';
import { AppPageHeaderControls } from '../../../../components/page-header/controls/controls';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { Store } from '../../../../store/index';

@View
@Component({
	name: 'RouteForumsTopicsView',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppUserAvatar,
		AppUserCardHover,
		AppForumBreadcrumbs,
		AppTimeAgo,
		AppPopper,
		AppFadeCollapse,
		AppWidgetCompiler,
		AppForumPostList,
		AppScrollAffix,
		AppMessageThreadAdd,
		AppMessageThreadPagination,
		FormForumPost,
		FormForumTopic,
		AppForumTopicUpvoteWidget,
	},
	directives: {
		AppTooltip,
		AppScrollTo,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	deps: { params: ['slug', 'id'], query: ['page'] },
	async resolver({ route }) {
		HistoryTick.sendBeacon('forum-topic', parseInt(route.params.id, 10));

		const payload = await Api.sendRequest(
			'/web/forums/topics/' + route.params.id + '?page=' + (route.query.page || 1)
		);

		if (payload && payload.topic) {
			const redirect = enforceLocation(route, { slug: payload.topic.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
})
export default class RouteForumsTopicsView extends BaseRouteComponent {
	@State
	app!: Store['app'];

	topic: ForumTopic = null as any;
	channel: ForumChannel = null as any;
	posts: ForumPost[] = [];

	isEditingTopic = false;
	isFollowing = false;
	canToggleDescription = false;
	showFullDescription = false;

	followerCount = 0;
	currentPage = 1;
	perPage = 0;
	userPostCounts: any = null;
	unfollowHover = false;

	readonly Screen = Screen;
	readonly Environment = Environment;

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get sort() {
		return this.$route.query.sort;
	}

	get shouldShowVoting() {
		return this.topic.can_upvote && !this.topic.is_locked;
	}

	get routeTitle() {
		if (this.topic) {
			return this.topic.title;
		}
		return null;
	}

	routeResolved($payload: any) {
		this.topic = new ForumTopic($payload.topic);
		this.channel = new ForumChannel($payload.channel);
		this.posts = ForumPost.populate($payload.posts);

		this.perPage = $payload.perPage;
		this.currentPage = $payload.page || 1;
		this.isFollowing = $payload.isFollowing || false;
		this.followerCount = $payload.followerCount || 0;
		this.userPostCounts = $payload.userPostCounts || {};
	}

	async onPostAdded(newPost: ForumPost, response: any) {
		// If their post was marked as spam, make sure they know.
		if (newPost.status === ForumPost.STATUS_SPAM) {
			Growls.info(
				this.$gettext(
					`Your post has been marked for review. Please allow some time for it to show on the site.`
				),
				this.$gettext(`Post Needs Review`)
			);
		}

		// When the new post comes into the DOM the hash will match and it will
		// scroll to it.
		this.$router.replace({
			name: this.$route.name,
			query: { page: response.page },
			hash: '#forum-post-' + newPost.id,
		});
	}

	editTopic() {
		this.isEditingTopic = true;
		Popper.hideAll();
	}

	closeEditTopic() {
		this.isEditingTopic = false;
	}

	async follow() {
		await this.topic.$follow();
		this.isFollowing = true;
		++this.followerCount;
	}

	async unfollow() {
		await this.topic.$unfollow();
		this.isFollowing = false;
		--this.followerCount;
	}

	pageChange() {
		// We try to switch pages and give it time for the main post to cut off
		// if it's too long. This is super hacky, it doesn't always work... I
		// don't really know how to make this better. Maybe a scroll directive
		// that gets loaded in once the content is loaded for main post? Would
		// sure be a lot of work just to get the scrolling hook working better.
		setTimeout(() => {
			Scroll.to('forum-posts-list', { animate: true });
		}, 200);
	}

	report() {
		ReportModal.show(this.topic);
	}
}
