<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import { vAppAuthRequired } from '../../../auth/auth-required-directive';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { Collaborator } from '../../../collaborator/collaborator.model';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/AppExpand.vue';
import AppMessageThreadAdd from '../../../message-thread/add/add.vue';
import AppMessageThreadItem from '../../../message-thread/item/item.vue';
import AppMessageThread from '../../../message-thread/message-thread.vue';
import { ModalConfirm } from '../../../modal/confirm/confirm-service';
import { Model } from '../../../model/model.service';
import AppPopper from '../../../popper/AppPopper.vue';
import { Popper } from '../../../popper/popper.service';
import { ReportModal } from '../../../report/modal/modal.service';
import AppStickerLayer from '../../../sticker/layer/AppStickerLayer.vue';
import { canPlaceStickerOnComment } from '../../../sticker/placement/placement.model';
import { useCommonStore } from '../../../store/common-store';
import AppTimelineListItem from '../../../timeline-list/item/item.vue';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import FormComment from '../../add/add.vue';
import AppCommentContent from '../../AppCommentContent.vue';
import { Comment, getCommentBlockReason } from '../../comment-model';
import AppCommentControls from '../../controls/AppCommentControls.vue';
import AppCommentWidgetCommentBlocked from '../comment-blocked/comment-blocked.vue';
import { useCommentWidget } from '../widget.vue';

let CommentNum = 0;

@Options({
	components: {
		AppCommentControls,
		AppCommentContent,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppTimelineListItem,
		AppFadeCollapse,
		AppPopper,
		AppExpand,
		AppCommentWidgetCommentBlocked,
		FormComment,

		// Since it's recursive it needs to be able to resolve itself.
		AppCommentWidgetComment: defineAsyncComponent({
			loader: () => Promise.resolve(AppCommentWidgetComment),
		}),
		AppStickerLayer,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppCommentWidgetComment extends Vue {
	@Prop({ type: Object, required: true }) model!: Model;
	@Prop({ type: Object, required: true }) comment!: Comment;
	@Prop({ type: Array, default: () => [] }) children!: Comment[];
	@Prop(Object) parent?: Comment;
	@Prop({ type: Boolean, default: false }) isLastInThread!: boolean;
	@Prop({ type: Boolean, default: false }) showChildren!: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	componentId = ++CommentNum;
	isFollowPending = false;
	isEditing = false;
	hasBypassedBlock = false;

	widget = setup(() => useCommentWidget()!);

	declare $el: HTMLDivElement;
	declare $refs: {
		scrollTarget: HTMLDivElement;
	};

	readonly Environment = Environment;

	mounted() {
		// Scroll it into view if it's active.
		if (this.isActive) {
			setTimeout(() => {
				this.$refs.scrollTarget.scrollIntoView({ behavior: 'smooth' });
			}, 250);
		}
	}

	get isChild() {
		return !!this.parent;
	}

	get isActive() {
		return this.widget.threadCommentId === this.comment.id;
	}

	get isOwner() {
		if (!this.widget.resourceOwner) {
			return false;
		}

		return this.widget.resourceOwner.id === this.comment.user.id;
	}

	get isCollaborator() {
		if (!this.widget.collaborators.length) {
			return false;
		}

		return !!this.widget.collaborators.find(
			collaborator => collaborator.user_id === this.comment.user.id
		);
	}

	/**
	 * Whether or not they own the resource this comment was posted to, or they are a collaborator
	 * on the resource with the correct permissions..
	 */
	get hasModPermissions() {
		if (!this.user) {
			return false;
		}

		// The owner of the resource the comment is attached to can remove.
		if (this.widget.resourceOwner && this.widget.resourceOwner.id === this.user.id) {
			return true;
		}

		// A collaborator for the game the comment is attached to can remove,
		// if they have the comments permission.
		if (this.widget.collaborators) {
			const collaborator = this.widget.collaborators.find(
				item => item.user_id === this.user!.id
			);

			if (collaborator instanceof Collaborator) {
				if (collaborator.perms.includes('all') || collaborator.perms.includes('comments')) {
					return true;
				}
			}
		}

		return false;
	}

	get canRemove() {
		if (!this.user) {
			return false;
		}

		// The comment author can remove their own comments.
		if (this.user.id === this.comment.user.id) {
			return true;
		}

		return this.hasModPermissions;
	}

	get canPin() {
		if (!this.user) {
			return false;
		}

		// Must have "mod" permissions to be able to pin.
		return !this.comment.parent_id && this.hasModPermissions;
	}

	get shouldShowReplies() {
		return this.children.length > 0 && this.showChildren;
	}

	get canFollow() {
		// Can't subscribe if...
		// they aren't logged in
		// this is a child comment
		// the resource belongs to them
		if (!this.user) {
			return false;
		} else if (this.isChild) {
			return false;
		} else if (this.widget.resourceOwner && this.widget.resourceOwner.id === this.user.id) {
			return false;
		}

		return true;
	}

	get blockReason() {
		return getCommentBlockReason(this.comment);
	}

	get shouldBlock() {
		if (this.hasBypassedBlock || !this.comment) {
			return false;
		}

		return this.blockReason !== false;
	}

	get showReplies() {
		return !this.parent && !this.showChildren;
	}

	get canPlaceStickers() {
		return canPlaceStickerOnComment(this.model, this.comment, this.parent);
	}

	get canReply() {
		return this.showReplies && this.canPlaceStickers;
	}

	startEdit() {
		this.isEditing = true;
		Popper.hideAll();
	}

	onCommentEdit(comment: Comment) {
		this.isEditing = false;
		this.widget.onCommentEdit(comment);
	}

	async removeComment() {
		this.isEditing = false;
		Popper.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this comment?`)
		);

		if (!result) {
			return;
		}

		try {
			await this.comment.$remove();
		} catch (err) {
			console.warn('Failed to remove comment');
			return;
		}

		this.widget.onCommentRemove(this.comment);
	}

	async pinComment() {
		await this.widget.pinComment(this.comment);
	}

	onFollowClick() {
		if (!this.comment.subscription) {
			this.comment.$follow();
		} else {
			this.comment.$removeFollow();
		}
	}

	copyPermalink() {
		Clipboard.copy(this.comment.permalink);
	}

	report() {
		ReportModal.show(this.comment);
	}

	onUnhideBlock() {
		this.hasBypassedBlock = true;
	}
}
</script>

<template>
	<AppStickerLayer no-mask>
		<AppMessageThreadItem
			:user="shouldBlock ? null : comment.user"
			:date="comment.posted_on"
			:is-showing-replies="shouldShowReplies"
			:is-reply="!!parent"
			:is-last="isLastInThread"
			:is-active="isActive"
			:is-blocked="shouldBlock"
		>
			<template v-if="comment.is_pinned || isOwner || isCollaborator" #tags>
				<span v-if="comment.is_pinned" class="tag">
					<AppJolticon icon="thumbtack" />
					<AppTranslate>Pinned</AppTranslate>
				</span>

				<span v-if="isOwner" class="tag">
					<AppTranslate>Owner</AppTranslate>
				</span>
				<span v-else-if="isCollaborator" class="tag">
					<AppTranslate>Collaborator</AppTranslate>
				</span>
			</template>

			<template #meta>
				<AppPopper v-if="user" popover-class="fill-darkest">
					<a v-app-tooltip="$gettext('More Options')" class="link-muted">
						<AppJolticon icon="ellipsis-v" class="middle" />
					</a>

					<template #popover>
						<div class="list-group list-group-dark">
							<a class="list-group-item has-icon" @click="copyPermalink">
								<AppJolticon icon="link" />
								<AppTranslate>Copy Link</AppTranslate>
							</a>
							<a v-if="canPin" class="list-group-item has-icon" @click="pinComment">
								<AppJolticon icon="thumbtack" />
								<AppTranslate v-if="comment.is_pinned">Unpin Comment</AppTranslate>
								<AppTranslate v-else>Pin Comment</AppTranslate>
							</a>
							<a
								v-if="user.id === comment.user.id"
								class="list-group-item has-icon"
								@click="startEdit"
							>
								<AppJolticon icon="edit" />
								<AppTranslate>Edit Comment</AppTranslate>
							</a>
							<a
								v-if="canFollow"
								v-app-tooltip.left="
									comment.subscription
										? $gettext(
												`You're following this comment thread and will be notified of replies.`
										  )
										: $gettext(
												`Get notifications when people post new replies to this thread.`
										  )
								"
								v-app-track-event="`comment-widget:follow-click`"
								class="list-group-item has-icon"
								@click="onFollowClick"
							>
								<AppJolticon icon="subscribe" />
								<AppTranslate v-if="comment.subscription">Following</AppTranslate>
								<AppTranslate v-else>Follow Thread</AppTranslate>
							</a>
							<a
								v-if="canRemove"
								class="list-group-item has-icon"
								@click="removeComment"
							>
								<AppJolticon icon="remove" notice />
								<AppTranslate>Remove Comment</AppTranslate>
							</a>
							<a
								v-if="user.id !== comment.user.id"
								class="list-group-item has-icon"
								@click="report"
							>
								<AppJolticon icon="flag" notice />
								<AppTranslate>Report Comment</AppTranslate>
							</a>
							<a
								v-if="user.permission_level >= 3"
								class="list-group-item has-icon"
								:href="`${Environment.baseUrl}/moderate/comments/remove/${comment.id}`"
								target="_blank"
							>
								<AppJolticon icon="remove" notice />
								<template v-if="canRemove">
									<AppTranslate>Remove Comment (Moderate)</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate>Remove Comment</AppTranslate>
								</template>
							</a>
						</div>
					</template>
				</AppPopper>
			</template>

			<template #default>
				<!--
			When scrolling an active comment into view, we don't want to target
			the top of the comment. We want to stop the scroll a bit higher in
			the viewport, so we hack this scroll target into the DOM and place
			it higher up than the comment itself.
			-->
				<div ref="scrollTarget" class="-scroll-target" />

				<template v-if="!isEditing">
					<AppCommentContent
						:comment="comment"
						:content="comment.comment_content"
						:can-place-stickers="canPlaceStickers"
					/>
				</template>
				<template v-else>
					<FormComment
						:model="comment"
						:comment-model="model"
						@submit="onCommentEdit"
						@cancel="isEditing = false"
					/>
				</template>
			</template>

			<template #controls>
				<AppCommentControls
					:model="model"
					:comment="comment"
					:children="children"
					:show-reply="showReplies"
					:can-reply="canReply"
					:can-place-stickers="canPlaceStickers"
				/>
			</template>

			<!-- Child Comments -->
			<template v-if="shouldShowReplies" #replies>
				<AppCommentWidgetComment
					v-for="(child, i) of children"
					:key="child.id"
					:model="model"
					:comment="child"
					:parent="comment"
					:is-last-in-thread="i === children.length - 1"
				/>
			</template>

			<template v-if="shouldBlock" #blocked>
				<AppCommentWidgetCommentBlocked
					:comment="comment"
					:reason="blockReason"
					@show="onUnhideBlock"
				/>
			</template>
		</AppMessageThreadItem>
	</AppStickerLayer>
</template>

<style lang="stylus" scoped>
.-scroll-target
	position: absolute
	top: -100px
</style>
