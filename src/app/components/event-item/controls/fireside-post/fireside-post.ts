import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { number } from '../../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { User } from '../../../../../_common/user/user.model';
import { AppCommentWidgetLazy } from '../../../lazy';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';
import AppEventItemControlsFiresidePostExtra from './extra/extra.vue';
import AppEventItemControlsFiresidePostStats from './stats/stats.vue';
import AppEventItemControlsFiresidePostStickers from './stickers/stickers.vue';
import AppEventItemControlsFiresidePostStickersTray from './stickers/tray/tray.vue';

@Component({
	components: {
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppEventItemControlsFiresidePostStats,
		AppEventItemControlsFiresidePostExtra,
		AppEventItemControlsFiresidePostStickers,
		AppEventItemControlsFiresidePostStickersTray,
	},
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
export default class AppEventItemControlsFiresidePost extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showCommentsButton?: boolean;

	@Prop({ type: Number, default: 0 })
	commentsCount!: number;

	@AppState
	user!: AppStore['user'];

	readonly GJ_IS_CLIENT!: boolean;

	stickersTrayOpen = false;

	@Emit('edit')
	emitEdit() {}

	@Emit('publish')
	emitPublish() {}

	@Emit('remove')
	emitRemove() {}

	@Emit('feature')
	emitFeature(_community: Community) {}

	@Emit('unfeature')
	emitUnfeature(_community: Community) {}

	@Emit('move-channel')
	emitMoveChannel(_movedTo: CommunityChannel) {}

	@Emit('reject')
	emitReject() {}

	@Emit('pin')
	emitPin() {}

	@Emit('unpin')
	emitUnpin() {}

	@Emit('like-change')
	emitLikeChange(_value: boolean) {}

	get canPublish() {
		return this.post.isDraft && !this.post.isScheduled && this.post.hasLead;
	}

	get showUserControls() {
		return this.post.isActive;
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

	get shouldShowStatsInNewLine() {
		return Screen.isXs;
	}

	openComments() {
		CommentModal.show({
			model: this.post,
			displayMode: 'comments',
		});
	}

	async openEdit() {
		if (await PostEditModal.show(this.post)) {
			this.emitEdit();
		}
	}

	async publish() {
		await this.post.$publish();
		this.emitPublish();
	}

	onClickStickers() {
		this.stickersTrayOpen = !this.stickersTrayOpen;
	}
}
