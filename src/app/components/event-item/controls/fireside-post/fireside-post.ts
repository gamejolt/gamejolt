import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
} from '../../../../../_common/drawer/drawer-store';
import { fuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { number } from '../../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { User } from '../../../../../_common/user/user.model';
import { AppCommentWidgetLazy } from '../../../lazy';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';
import AppEventItemControlsFiresidePostExtra from './extra/extra.vue';
import AppEventItemControlsFiresidePostStats from './stats/stats.vue';

@Component({
	components: {
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppEventItemControlsFiresidePostStats,
		AppEventItemControlsFiresidePostExtra,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
})
export default class AppEventItemControlsFiresidePost extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Boolean)) showCommentsButton!: boolean;
	@Prop(propRequired(String)) eventLabel!: string;

	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@AppState user!: AppStore['user'];

	private commentStore: null | CommentStoreModel = null;

	readonly GJ_IS_CLIENT!: boolean;
	readonly Screen = Screen;
	readonly fuzzynumber = fuzzynumber;
	readonly number = number;

	@Emit('edit') emitEdit() {}
	@Emit('publish') emitPublish() {}
	@Emit('remove') emitRemove() {}
	@Emit('feature') emitFeature(_community: Community) {}
	@Emit('unfeature') emitUnfeature(_community: Community) {}
	@Emit('move-channel') emitMoveChannel(_movedTo: CommunityChannel) {}
	@Emit('reject') emitReject(_community: Community) {}
	@Emit('pin') emitPin() {}
	@Emit('unpin') emitUnpin() {}
	@Emit('like-change') emitLikeChange(_value: boolean) {}
	@Emit('sticker') emitSticker() {}

	get commentsCount() {
		return this.commentStore ? this.commentStore.totalCount : 0;
	}

	get canPublish() {
		return (
			this.post.isDraft &&
			!this.post.isScheduled &&
			this.post.hasLead &&
			this.post.canPublishToCommunities()
		);
	}

	get showUserControls() {
		return this.post.isActive && !this.post.is_processing;
	}

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowEdit() {
		return this.hasPerms;
	}

	get shouldShowExtra() {
		return this.user instanceof User;
	}

	get shouldShowCommentsButton() {
		return this.showCommentsButton;
	}

	get shouldShowStickersButton() {
		return this.post.canPlaceSticker;
	}

	get shouldShowStatsInNewLine() {
		return Screen.isXs;
	}

	created() {
		this.commentStore = lockCommentStore(this.commentManager, 'Fireside_Post', this.post.id);
		setCommentCount(this.commentStore, this.post.comment_count);
	}

	destroyed() {
		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	get shouldShowLike() {
		return this.post.canLike;
	}

	openComments() {
		Analytics.trackEvent('post-controls', 'comments', this.eventLabel);
		CommentModal.show({
			model: this.post,
			displayMode: 'comments',
		});
	}

	async openEdit() {
		Analytics.trackEvent('post-controls', 'edit', this.eventLabel);
		if (await PostEditModal.show(this.post)) {
			this.emitEdit();
		}
	}

	async publish() {
		Analytics.trackEvent('post-controls', 'publish', this.eventLabel);
		await this.post.$publish();
		this.emitPublish();
	}

	async placeSticker() {
		Analytics.trackEvent('post-controls', 'sticker-place', this.eventLabel);
		setDrawerOpen(this.drawerStore, true);
		this.emitSticker();
	}
}
