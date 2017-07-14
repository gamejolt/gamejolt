import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { ForumPost } from '../../../../../lib/gj-lib-client/components/forum/post/post.model';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Popover } from '../../../../../lib/gj-lib-client/components/popover/popover.service';
import { ReportModal } from '../../../../../lib/gj-lib-client/components/report/modal/modal.service';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { FormForumPost } from '../../../forms/forum/post/post';
import { AppMessageThreadItem } from '../../../../../lib/gj-lib-client/components/message-thread/item/item';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Store } from '../../../../store/index';
import { AppMessageThreadAdd } from '../../../../../lib/gj-lib-client/components/message-thread/add/add';

@View
@Component({
	components: {
		AppScrollInview,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppJolticon,
		AppPopover,
		AppWidgetCompiler,
		AppExpand,
		FormForumPost,

		// Since it's recursive it needs to be able to resolve itself.
		AppForumPostListItem: () => Promise.resolve(AppForumPostListItem),
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		date,
		number,
	},
})
export class AppForumPostListItem extends Vue {
	@Prop(ForumTopic) topic: ForumTopic;
	@Prop(ForumPost) post: ForumPost;
	@Prop(Boolean) isReply: boolean;
	@Prop(Boolean) showReplies: boolean;

	@State app: Store['app'];

	isEditing = false;
	isReplying = false;
	isShowingReplies = false;

	showingParent = false;
	parent: ForumPost | null = null;
	replies: ForumPost[] = [];
	totalReplyCount = 0;

	date = date;
	number = number;
	Environment = Environment;

	get id() {
		return (this.isReply ? this.post.parent_post_id + '-' : '') + this.post.id;
	}

	get isActive() {
		// We never mark ourselves as active if we're showing as a reply.
		return !this.parent && this.$route.hash === '#forum-post-' + this.id;
	}

	@Watch('isActive', { immediate: true })
	async onActiveChanged(isActive: boolean) {
		// Wait till we're compiled into the DOM.
		await this.$nextTick();
		if (isActive) {
			Scroll.to(this.$el);
		}
	}

	toggleReplies() {
		if (this.isShowingReplies) {
			this.isShowingReplies = false;
			return;
		}

		this.loadReplies();
	}

	async loadReplies() {
		try {
			const payload = await Api.sendRequest(
				'/web/forums/posts/replies/' + this.post.id,
				undefined,
				{ noErrorRedirect: true }
			);

			this.replies = ForumPost.populate(payload.replies);
			this.totalReplyCount = payload.repliesCount || 0;

			if (!this.isShowingReplies) {
				this.isShowingReplies = true;
			}
		} catch (e) {
			Growls.error(
				this.$gettext(`Couldn't load replies for some reason.`),
				this.$gettext(`Loading Failed`)
			);
		}
	}

	async loadParentPost() {
		if (this.showingParent) {
			this.showingParent = false;
			return;
		}

		// Don't load it in more than once.
		if (this.parent) {
			this.showingParent = true;
		}

		try {
			const payload = await Api.sendRequest('/web/forums/posts/parent/' + this.post.id, {
				noErrorRedirect: true,
			});
			this.parent = new ForumPost(payload.parent);
			this.showingParent = true;
		} catch (e) {
			// The post was probably removed.
			this.parent = null;
			this.showingParent = true;
		}
	}

	reply() {
		this.isReplying = true;
	}

	closeReply() {
		this.isReplying = false;
	}

	onReplied(newPost: ForumPost, response: any) {
		this.isReplying = false;

		// If the replies list is open, refresh it.
		if (this.isShowingReplies) {
			this.loadReplies();
		}

		this.$emit('replied', newPost, response);
	}

	edit() {
		this.isEditing = true;
		Popover.hideAll();
	}

	closeEdit() {
		this.isEditing = false;
	}

	report() {
		ReportModal.show(this.post);
	}

	onInviewChange(isInView: boolean) {
		if (isInView && this.post.notification) {
			// Don't wait for success before updating the view.
			this.post.notification.$read();
			this.post.notification = undefined;
		}
	}

	copyPermalink() {
		Clipboard.copy(this.post.getPermalink());
	}
}
