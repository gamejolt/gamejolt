import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./controls.html?style=./controls.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../lib/gj-lib-client/components/popover/popover';
import { AppGameFollowWidget } from '../../../game/follow-widget/follow-widget';
import { AppFiresidePostLikeWidget } from '../../../../../lib/gj-lib-client/components/fireside/post/like/widget/widget';
import { AppSocialTwitterShare } from '../../../../../lib/gj-lib-client/components/social/twitter/share/share';
import { AppSocialFacebookLike } from '../../../../../lib/gj-lib-client/components/social/facebook/like/like';
import { Store } from '../../../../store/index';
import { DevlogPostEditModal } from '../../../devlog/post/edit-modal/edit-modal-service';
import { FormCommentLazy, AppCommentWidgetLazy } from '../../../lazy';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppCommentVideoLikeWidget } from '../../../../../lib/gj-lib-client/components/comment/video/like-widget/like-widget';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { CommentModal } from '../../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import {
	CommentState,
	CommentStore,
	CommentAction,
	CommentMutation,
	CommentStoreModel,
} from '../../../../../lib/gj-lib-client/components/comment/comment-store';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
		AppGameFollowWidget,
		AppCommentWidgetAdd: FormCommentLazy,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedControls extends Vue {
	@Prop(FiresidePost) post?: FiresidePost;
	@Prop(CommentVideo) video?: CommentVideo;
	@Prop(Game) game?: Game;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) showEditControls?: boolean;
	@Prop({ type: Boolean, default: true })
	showExtraInfo: boolean;
	@Prop(Boolean) showComments?: boolean;
	@Prop(Boolean) inModal?: boolean;

	@State app: Store['app'];
	@CommentState getCommentStore: CommentStore['getCommentStore'];
	@CommentAction lockCommentStore: CommentStore['lockCommentStore'];
	@CommentMutation releaseCommentStore: CommentStore['releaseCommentStore'];
	@CommentMutation setCommentCount: CommentStore['setCommentCount'];

	commentStore: CommentStoreModel | null = null;
	isShowingShare = false;

	readonly number = number;
	readonly Screen = Screen;
	readonly FiresidePost = FiresidePost;

	get hasDevlogsPerms() {
		return this.game && this.game.hasPerms('devlogs');
	}

	get sharePopoverId() {
		if (!this.post) {
			return '';
		}
		return `activity-feed-share-${this.inModal ? 'modal' : 'no-modal'}-${this.post.id}`;
	}

	get shareUrl() {
		if (!this.post) {
			return '';
		}

		return (
			Environment.baseUrl +
			this.$router.resolve({
				name: 'discover.games.view.devlog.view',
				params: {
					slug: this.post.game.slug,
					id: this.post.game.id + '',
					postSlug: this.post.slug,
				},
			}).href
		);
	}

	get shouldShowManage() {
		return this.shouldShowManageControls || this.shouldShowStats;
	}

	get shouldShowManageControls() {
		return this.post && this.game && this.showEditControls && this.hasDevlogsPerms;
	}

	// TODO: Figure out if this can be collapsed into the same func as "showManageControls"
	get shouldShowStats() {
		return (
			!!this.post &&
			this.showExtraInfo &&
			!!this.app.user &&
			(this.post.user.id === this.app.user.id || this.hasDevlogsPerms)
		);
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.count : 0;
	}

	async created() {
		if (this.post) {
			this.commentStore = await this.lockCommentStore({
				resource: 'Fireside_Post',
				resourceId: this.post.id,
			});

			// Bootstrap it with the post comment count since that's all we have.
			this.setCommentCount({ store: this.commentStore, count: this.post.comment_count });
		}
	}

	destroyed() {
		if (this.commentStore) {
			this.releaseCommentStore(this.commentStore);
			this.commentStore = null;
		}
	}

	onCommentAdded() {
		this.$emit('expanded');
	}

	openComments() {
		if (this.post) {
			CommentModal.show({ resource: 'Fireside_Post', resourceId: this.post.id });
		}

		this.$emit('expanded');
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	async showEdit() {
		if (this.post) {
			if (await DevlogPostEditModal.show(this.post)) {
				this.$emit('edited');
			}
		}
	}

	async publishPost() {
		if (this.post) {
			await this.post.$publish();
			this.$emit('published');
		}
	}

	async removePost() {
		if (this.post) {
			if (await this.post.remove()) {
				this.$emit('removed');
			}
		}
	}
}
