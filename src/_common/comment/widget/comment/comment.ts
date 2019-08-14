import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Popper } from '../../../../components/popper/popper.service';
import { findRequiredVueParent } from '../../../../utils/vue';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue';
import { date } from '../../../../vue/filters/date';
import { number } from '../../../../vue/filters/number';
import { AppState, AppStore } from '../../../../vue/services/app/app-store';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import { AppAuthRequired } from '../../../auth/auth-required-directive';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { Environment } from '../../../environment/environment.service';
import AppExpand from '../../../expand/expand.vue';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import AppMessageThreadAdd from '../../../message-thread/add/add.vue';
import AppMessageThreadItem from '../../../message-thread/item/item.vue';
import AppMessageThread from '../../../message-thread/message-thread.vue';
import { ModalConfirm } from '../../../modal/confirm/confirm-service';
import AppPopper from '../../../popper/popper.vue';
import { ReportModal } from '../../../report/modal/modal.service';
import { AppTooltip } from '../../../tooltip/tooltip';
import FormComment from '../../add/add.vue';
import { Comment } from '../../comment-model';
import AppCommentContent from '../../content/content.vue';
import AppCommentControls from '../../controls/controls.vue';
import AppCommentWidgetTS from '../widget';
import AppCommentWidget from '../widget.vue';

let CommentNum = 0;

@Component({
	components: {
		AppCommentControls,
		AppCommentContent,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppFadeCollapse,
		AppJolticon,
		AppPopper,
		AppExpand,
		FormComment,

		// Since it's recursive it needs to be able to resolve itself.
		AppCommentWidgetComment: () => Promise.resolve(AppCommentWidgetComment),
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
		date,
	},
})
export default class AppCommentWidgetComment extends Vue {
	@Prop(Comment)
	comment!: Comment;

	@Prop(Array)
	children?: Comment[];

	@Prop(Comment)
	parent?: Comment;

	@Prop(String)
	resource!: string;

	@Prop(Number)
	resourceId!: number;

	@Prop(Boolean)
	isLastInThread?: boolean;

	@Prop(Boolean)
	showChildren?: boolean;

	@AppState
	user!: AppStore['user'];

	componentId = ++CommentNum;
	isFollowPending = false;
	isEditing = false;

	widget!: AppCommentWidgetTS;

	$el!: HTMLDivElement;
	$refs!: {
		scrollTarget: HTMLDivElement;
	};

	readonly date = date;
	readonly Environment = Environment;

	created() {
		this.widget = findRequiredVueParent(this, AppCommentWidget) as AppCommentWidgetTS;
	}

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

			if (
				collaborator &&
				(collaborator.perms.indexOf('comments') !== -1 ||
					collaborator.perms.indexOf('all') !== -1)
			) {
				return true;
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
		return this.children && this.children.length > 0 && this.showChildren;
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

	startEdit() {
		this.isEditing = true;
		Popper.hideAll();
	}

	onCommentEdit(comment: Comment) {
		this.isEditing = false;
		this.widget._onCommentEdit(comment);
	}

	async removeComment() {
		this.isEditing = false;
		Popper.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this comment?`),
			undefined,
			'yes'
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

		this.widget._onCommentRemove(this.comment);
	}

	async pinComment() {
		await this.widget._pinComment(this.comment);
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
}
