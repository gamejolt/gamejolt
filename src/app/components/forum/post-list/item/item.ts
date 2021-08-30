import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { date } from '../../../../../_common/filters/date';
import { number } from '../../../../../_common/filters/number';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppMessageThreadAdd from '../../../../../_common/message-thread/add/add.vue';
import AppMessageThreadItem from '../../../../../_common/message-thread/item/item.vue';
import AppMessageThread from '../../../../../_common/message-thread/message-thread.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../_common/report/modal/modal.service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/inview.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store/index';
import FormForumPost from '../../../forms/forum/post/post.vue';

const InviewConfig = new ScrollInviewConfig();

@Options({
	components: {
		AppScrollInview,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppExpand,
		FormForumPost,
		AppPopper,
		AppContentViewer,

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
	@Prop(ForumTopic) topic!: ForumTopic;
	@Prop(ForumPost) post!: ForumPost;
	@Prop(Boolean) isReply!: boolean;
	@Prop(Boolean) showReplies!: boolean;
	@Prop(Boolean) isLastInThread?: boolean;

	@State app!: Store['app'];

	isEditing = false;
	isReplying = false;
	isShowingReplies = false;

	showingParent = false;
	parent: ForumPost | null = null;
	replies: ForumPost[] = [];
	totalReplyCount = 0;

	readonly InviewConfig = InviewConfig;
	readonly date = date;
	readonly number = number;
	readonly Environment = Environment;

	@Emit('replied')
	emitReplied(_newPost: ForumPost, _payload: any) {}

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
		await nextTick();
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
			showErrorGrowl(
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
			const payload = await Api.sendRequest(
				'/web/forums/posts/parent/' + this.post.id,
				undefined,
				{
					noErrorRedirect: true,
				}
			);
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

		this.emitReplied(newPost, response);
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
