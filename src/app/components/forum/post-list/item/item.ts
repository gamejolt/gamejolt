import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { ForumPost } from 'game-jolt-frontend-lib/components/forum/post/post.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import AppMessageThreadAdd from 'game-jolt-frontend-lib/components/message-thread/add/add.vue';
import AppMessageThreadItem from 'game-jolt-frontend-lib/components/message-thread/item/item.vue';
import AppMessageThread from 'game-jolt-frontend-lib/components/message-thread/message-thread.vue';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { ReportModal } from 'game-jolt-frontend-lib/components/report/modal/modal.service';
import { AppScrollInview } from 'game-jolt-frontend-lib/components/scroll/inview/inview';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppWidgetCompiler } from 'game-jolt-frontend-lib/components/widget-compiler/widget-compiler';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../store/index';
import FormForumPost from '../../../forms/forum/post/post.vue';

@Component({
	components: {
		AppScrollInview,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppJolticon,
		AppWidgetCompiler,
		AppExpand,
		FormForumPost,
		AppPopper,

		// Since it's recursive it needs to be able to resolve itself.
		AppForumPostListItem: () => Promise.resolve(AppForumPostListItem),
	},
	directives: {
		AppTooltip,
	},
	filters: {
		date,
		number,
	},
})
export default class AppForumPostListItem extends Vue {
	@Prop(ForumTopic)
	topic!: ForumTopic;
	@Prop(ForumPost)
	post!: ForumPost;
	@Prop(Boolean)
	isReply!: boolean;
	@Prop(Boolean)
	showReplies!: boolean;
	@Prop(Boolean)
	isLastInThread?: boolean;

	@State
	app!: Store['app'];

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
			Scroll.to(this.$el as HTMLElement);
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
		Popper.hideAll();
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
