import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { Analytics } from '../../../analytics/analytics.service';
import FormComment from '../../../comment/add/add.vue';
import { Comment } from '../../../comment/comment-model';
import { CommentStoreManager, CommentStoreManagerKey } from '../../../comment/comment-store';
import { ContentDocument } from '../../../content/content-document';
import {
	assignDrawerStoreGhostCallback as assignDrawerStoreMoveCallback,
	commitDrawerStoreItemPlacement,
	DrawerStore,
	DrawerStoreKey,
	setDrawerStoreActiveItem,
} from '../../../drawer/drawer-store';
import { FiresidePost } from '../../../fireside/post/post-model';
import { MediaItem } from '../../../media-item/media-item-model';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';

const COMMENT_FORM_WIDTH = 300;
const COMMENT_FORM_PADDING = 16;

@Component({
	components: {
		FormComment,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppStickerDrawerGhost extends Vue {
	@Inject(DrawerStoreKey) drawer!: DrawerStore;
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	$el!: HTMLDivElement;
	isCommentOpen = false;
	commentStyle = {
		left: 'calc(100% - 16px)',
		right: '',
		top: 'calc(100% - 52px)',
	};
	isCommentBelowSticker = false;
	applyButtonLeft = false;
	comment = new Comment();

	get sticker() {
		return this.drawer.sticker!;
	}

	get shouldShowStickerControls() {
		return !!this.drawer.placedItem;
	}

	private get itemRotation() {
		if (this.drawer.placedItem) {
			return `rotate(${this.drawer.placedItem.rotation * 90 - 45}deg)`;
		} else {
			return null;
		}
	}

	get itemStyling() {
		return {
			transform: this.itemRotation,
			width: this.drawer.stickerSize + 'px',
			height: this.drawer.stickerSize + 'px',
		};
	}

	get controlsStyling() {
		const controlSize = 32;
		if (this.isCommentOpen && this.isCommentBelowSticker) {
			return {
				left: this.applyButtonLeft ? '' : 'calc(100%)',
				right: this.applyButtonLeft ? 'calc(100%)' : '',
				top: `calc(100% - ${this.drawer.stickerSize / 2 + controlSize / 2}px)`,
				width: controlSize + 'px',
				height: controlSize + 'px',
			};
		} else {
			return {
				left: this.drawer.stickerSize / 2 - controlSize / 2 + 'px',
				width: controlSize + 'px',
				height: controlSize + 'px',
			};
		}
	}

	get itemClasses() {
		const classes = [];

		if (this.drawer.isDragging) {
			classes.push('-dragging');
		}

		if (this.drawer.targetController) {
			classes.push('-uncommitted');
		}

		return classes;
	}

	get commentParentModel() {
		return this.drawer.targetController?.model;
	}

	get shouldShowComment() {
		return this.shouldShowStickerControls && this.isCommentOpen;
	}

	mounted() {
		assignDrawerStoreMoveCallback(this.drawer, this.updateGhostPosition);
	}

	async onConfirmPlacement() {
		Analytics.trackEvent('sticker-drawer', 'confirm-placement');

		const parentModel = this.commentParentModel;

		const placement = await commitDrawerStoreItemPlacement(this.drawer);

		// Save the comment and attach it to the sticker placement.
		if (placement && this.isCommentOpen) {
			const contentDoc = ContentDocument.fromJson(this.comment.comment_content);

			if (contentDoc.hasContent) {
				// Overwrite the custom "sticker-comment" here.
				// Store it has the real comment type. This means we also validate it
				// as the real type in backend, which is ok since we allow editing the comment
				// with the real type anyway.
				contentDoc.context = 'fireside-post-comment';

				// Find the parent fireside post:
				let resourceId = 0;
				let parentId: number | undefined = undefined;

				if (parentModel instanceof FiresidePost) {
					resourceId = parentModel.id;
				} else if (parentModel instanceof Comment) {
					resourceId = parentModel.resource_id;

					// If the sticker is placed on a comment, this new comment will be added to the
					// reply thread of this parent comment.
					// When the sticker is placed on a comment already in a thread, place it in the
					// same thread.
					if (parentModel.parent_id) {
						parentId = parentModel.parent_id;
					} else {
						parentId = parentModel.id;
					}
				} else if (parentModel instanceof MediaItem) {
					resourceId = parentModel.parent_id;
				}

				const comment = new Comment({
					resource: 'Fireside_Post',
					resource_id: resourceId,
					comment_content: contentDoc.toJson(),
					parent_id: parentId,
					stickerPlacementId: placement.id,
				});
				const payload = await comment.$save();
				const newComment = new Comment(payload.comment);
				// TODO: somehow add this comment to the comment store
			}
		}
	}
	onStartDrag(event: MouseEvent | TouchEvent) {
		Analytics.trackEvent('sticker-drawer', 'start-drag');
		setDrawerStoreActiveItem(this.drawer, this.sticker, event, true);
	}

	updateGhostPosition(pos: { left: number; top: number }) {
		const { left, top } = pos;
		this.$el.style.transform = `translate3d(${left}px, ${top}px, 0)`;

		this.updateCommentFormPosition(left);
	}

	updateCommentFormPosition(left: number) {
		// Calculate and update positioning of the comment form:
		const screenWidth = Screen.width;

		// By default, the comment form is anchored the the right of the sticker.
		// Check that it has enough space:
		if (
			screenWidth - left <
			COMMENT_FORM_WIDTH + COMMENT_FORM_PADDING + this.drawer.stickerSize
		) {
			// The form cannot be placed right of the sticker because it's too close to the right border
			// of the window. Try to place it left of the sticker instead.

			if (left < COMMENT_FORM_WIDTH - COMMENT_FORM_PADDING) {
				// Screen can't fit the comment either left or right. Place below the sticker.
				// "offset" is to place the form centered to the sticker.
				let offset = COMMENT_FORM_WIDTH / 2 - this.drawer.stickerSize / 2;

				// By centering the form below the sticker, it might still be that the form sticks
				// out over the screen's left/right borders if the sticker is too close to it.
				const halfOffset = COMMENT_FORM_WIDTH / 2 + this.drawer.stickerSize / 2;
				if (left < offset) {
					// Too far left.
					offset += offset - left;
					this.applyButtonLeft = false;
				} else if (left + halfOffset > screenWidth) {
					// Too far right. Move button to the left of the sticker.
					offset -= left + halfOffset - screenWidth;
					this.applyButtonLeft = true;
				} else {
					// Fits centered below sticker.
					this.applyButtonLeft = false;
				}

				this.commentStyle = {
					left: '',
					// Move slightly over center of sticker, because the button is smaller.
					top: 'calc(100% - 4px)',
					right: -offset + 'px',
				};
				this.isCommentBelowSticker = true;
			} else {
				this.commentStyle = {
					left: '',
					// Adjust so the comment form is placed slightly below the sticker for a connected look.
					top: 'calc(100% - 52px)',
					right: 'calc(100% - 16px)',
				};
				this.isCommentBelowSticker = false;
			}
		} else {
			this.commentStyle = {
				// Adjust so the comment form is placed slightly below the sticker for a connected look.
				left: 'calc(100% - 16px)',
				top: 'calc(100% - 52px)',
				right: '',
			};
			this.isCommentBelowSticker = false;
		}
	}

	onOpenComment() {
		this.isCommentOpen = true;
	}

	onCommentContentChanged(content: string) {
		this.comment.comment_content = content;
	}
}
