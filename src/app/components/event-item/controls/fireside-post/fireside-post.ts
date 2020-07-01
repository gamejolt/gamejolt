import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { fuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { number } from '../../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { StickerPlacementModal } from '../../../../../_common/sticker/placement/modal/modal.service';
import { StickerSelectModal } from '../../../../../_common/sticker/select-modal.ts/select-modal.service';
import { Sticker } from '../../../../../_common/sticker/sticker.model';
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
	filters: {
		number,
		fuzzynumber,
	},
})
export default class AppEventItemControlsFiresidePost extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Boolean)) showCommentsButton!: boolean;
	@Prop(propOptional(Number, 0)) commentsCount!: number;
	@Prop(propOptional(Boolean, false)) showStickers!: boolean;

	@AppState
	user!: AppStore['user'];

	readonly GJ_IS_CLIENT!: boolean;
	readonly Screen = Screen;

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
	emitReject(_community: Community) {}

	@Emit('pin')
	emitPin() {}

	@Emit('unpin')
	emitUnpin() {}

	@Emit('like-change')
	emitLikeChange(_value: boolean) {}

	emitStickersVisibilityChange(visible: boolean) {
		if (this.showStickers !== visible) {
			this.$emit('stickers-visibility-change', visible);
		}
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

	get shouldShowStickersButton() {
		return this.post.canPlaceSticker;
	}

	get shouldShowStatsInNewLine() {
		return Screen.isXs;
	}

	get shouldShowStickersBar() {
		return this.post.stickers.length > 0;
	}

	get previewStickerMax() {
		if (Screen.isXs) {
			return 5;
		}

		return 16;
	}

	get previewStickers() {
		const uniqueStickers = [] as Sticker[];
		for (const stickerPlacement of this.post.stickers) {
			if (uniqueStickers.every(i => i.id !== stickerPlacement.sticker.id)) {
				uniqueStickers.push(stickerPlacement.sticker);
				if (uniqueStickers.length === this.previewStickerMax) {
					break;
				}
			}
		}

		return uniqueStickers.reverse();
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

	async placeSticker() {
		const sticker = await StickerSelectModal.show(this.post);
		if (sticker) {
			const post = await StickerPlacementModal.show(this.post, sticker);
			if (post) {
				Object.assign(this.post, post);
				this.emitStickersVisibilityChange(true);
			}
		}
	}

	onClickShowStickers() {
		this.emitStickersVisibilityChange(!this.showStickers);
	}
}
