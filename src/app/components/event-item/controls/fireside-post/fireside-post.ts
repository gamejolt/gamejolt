import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import { CommentModal } from '../../../../../_common/comment/modal/modal.service';
import AppCommentVideoLikeWidget from '../../../../../_common/comment/video/like-widget/like-widget.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { number } from '../../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppSocialFacebookLike } from '../../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../../_common/social/twitter/share/share';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { User } from '../../../../../_common/user/user.model';
import { AppCommentWidgetLazy } from '../../../lazy';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';
import AppEventItemControlsFiresidePostExtra from './extra/extra.vue';

@Component({
	components: {
		AppPopper,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppCommentVideoLikeWidget,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppEventItemControlsFiresidePostExtra,
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
	showUserFollow?: boolean;

	@Prop(Boolean)
	showCommentsButton?: boolean;

	@Prop({ type: Number, default: 0 })
	commentsCount!: number;

	@AppState
	user!: AppStore['user'];

	isShowingShare = false;

	readonly number = number;
	readonly GJ_IS_CLIENT!: boolean;

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

	get canPublish() {
		return this.post.isDraft && !this.post.isScheduled && this.post.hasLead;
	}

	get showUserControls() {
		return this.post.isActive;
	}

	get shareUrl() {
		return Environment.baseUrl + this.$router.resolve(this.post.routeLocation).href;
	}

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowStats() {
		return this.hasPerms && this.post.isActive;
	}

	get shouldShowEdit() {
		return this.hasPerms;
	}

	get shouldShowExtra() {
		return this.user instanceof User;
	}

	get shouldShowCommentsButton() {
		if (!this.showCommentsButton) {
			return false;
		}

		if (!this.commentsCount && this.post.communities.length > 0) {
			const community = this.post.communities[0].community;
			return !community.isBlocked;
		}

		return true;
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	openComments() {
		CommentModal.show({
			resource: 'Fireside_Post',
			resourceId: this.post.id,
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
}
