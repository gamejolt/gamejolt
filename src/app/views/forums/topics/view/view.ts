import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumPost } from 'game-jolt-frontend-lib/components/forum/post/post.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { HistoryTick } from 'game-jolt-frontend-lib/components/history-tick/history-tick-service';
import AppMessageThreadAdd from 'game-jolt-frontend-lib/components/message-thread/add/add.vue';
import AppMessageThreadPagination from 'game-jolt-frontend-lib/components/message-thread/pagination/pagination.vue';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { ReportModal } from 'game-jolt-frontend-lib/components/report/modal/modal.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppScrollTo } from 'game-jolt-frontend-lib/components/scroll/to/to.directive';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from 'game-jolt-frontend-lib/components/user/verified-tick/verified-tick.vue';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import FormForumPost from '../../../../components/forms/forum/post/post.vue';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumPostList from '../../../../components/forum/post-list/post-list.vue';
import AppForumTopicUpvoteWidget from '../../../../components/forum/topic/upvote-widget/upvote-widget.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { Store } from '../../../../store/index';

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
		AppForumPostList,
		AppScrollAffix,
		AppMessageThreadAdd,
		AppMessageThreadPagination,
		FormForumPost,
		FormForumTopic,
		AppForumTopicUpvoteWidget,
		AppContentViewer,
		AppUserVerifiedTick,
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
