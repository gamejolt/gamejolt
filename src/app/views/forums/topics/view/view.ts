import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { enforceLocation } from '../../../../../utils/router';
import { Api } from '../../../../../_common/api/api.service';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../../_common/filters/number';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import AppMessageThreadAdd from '../../../../../_common/message-thread/add/add.vue';
import AppMessageThreadPagination from '../../../../../_common/message-thread/pagination/pagination.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../_common/report/modal/modal.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/affix/affix.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { AppScrollTo } from '../../../../../_common/scroll/to/to.directive';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import FormForumPost from '../../../../components/forms/forum/post/post.vue';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumPostList from '../../../../components/forum/post-list/post-list.vue';
import AppForumTopicUpvoteWidget from '../../../../components/forum/topic/upvote-widget/upvote-widget.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { Store } from '../../../../store/index';

@Options({
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
			showInfoGrowl(
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
