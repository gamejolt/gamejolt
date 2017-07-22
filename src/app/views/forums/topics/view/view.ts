import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { ReportModal } from '../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Popover } from '../../../../../lib/gj-lib-client/components/popover/popover.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { enforceLocation } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { HistoryTick } from '../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppScrollTo } from '../../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppForumPostList } from '../../../../components/forum/post-list/post-list';
import { AppScrollAffix } from '../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { FormForumPost } from '../../../../components/forms/forum/post/post';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppMessageThreadAdd } from '../../../../../lib/gj-lib-client/components/message-thread/add/add';
import { Store } from '../../../../store/index';
import { AppMessageThreadPagination } from '../../../../../lib/gj-lib-client/components/message-thread/pagination/pagination';
import { FormForumTopic } from '../../../../components/forms/forum/topic/topic';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppPageHeader,
		AppJolticon,
		AppUserAvatar,
		AppForumBreadcrumbs,
		AppTimeAgo,
		AppPopover,
		AppFadeCollapse,
		AppWidgetCompiler,
		AppForumPostList,
		AppScrollAffix,
		AppMessageThreadAdd,
		AppMessageThreadPagination,
		FormForumPost,
		FormForumTopic,
	},
	directives: {
		AppTooltip,
		AppScrollTo,
		AppPopoverTrigger,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export default class RouteForumsTopicsView extends BaseRouteComponent {
	@State app: Store['app'];

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

	Screen = makeObservableService(Screen);
	Environment = Environment;

	get loginUrl() {
		return Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath);
	}

	@RouteResolve({ cache: true })
	async routeResolve(this: undefined, route: VueRouter.Route) {
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
	}

	routed() {
		this.topic = new ForumTopic(this.$payload.topic);
		this.channel = new ForumChannel(this.$payload.channel);
		this.posts = ForumPost.populate(this.$payload.posts);

		Meta.title = this.topic.title;

		this.perPage = this.$payload.perPage;
		this.currentPage = this.$payload.page || 1;
		this.isFollowing = this.$payload.isFollowing || false;
		this.followerCount = this.$payload.followerCount || 0;
		this.userPostCounts = this.$payload.userPostCounts || {};
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
		Popover.hideAll();
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
