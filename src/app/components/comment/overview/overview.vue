<script lang="ts">
import { Emit, Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import {
	Comment,
	getCommentBlockReason,
	getCommentModelResourceName,
} from '../../../../_common/comment/comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	getCommentStore,
} from '../../../../_common/comment/comment-store';
import { DisplayMode } from '../../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { Model } from '../../../../_common/model/model.service';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import { illNoCommentsSmall } from '../../../img/ill/illustrations';

@Options({
	components: {
		AppFadeCollapse,
		AppUserAvatarImg,
		AppUserCardHover,
		AppContentViewer,
		AppUserVerifiedTick,
		AppIllustration,
	},
})
export default class AppCommentOverview extends Vue {
	@Prop(Array)
	comments!: Comment[];

	@Prop(Object)
	model!: Model;

	@Prop(String)
	displayMode!: DisplayMode;

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	@Emit('reload-comments')
	emitReloadComments() {}

	readonly illNoCommentsSmall = illNoCommentsSmall;

	get displayComments() {
		return this.comments.filter(c => getCommentBlockReason(c) === false);
	}

	get hasComments() {
		const store = getCommentStore(
			this.commentManager,
			getCommentModelResourceName(this.model),
			this.model.id
		);
		if (store instanceof CommentStoreModel) {
			return store.totalCount > 0;
		}
		// If we didn't get the store information yet, treat this as if it's loading in.
		return true;
	}

	get commentStoreDirtyState() {
		const store = getCommentStore(
			this.commentManager,
			getCommentModelResourceName(this.model),
			this.model.id
		);
		if (store instanceof CommentStoreModel) {
			return store.overviewNeedsRefresh;
		}
		return false;
	}

	@Watch('commentStoreDirtyState')
	reloadComments() {
		if (this.commentStoreDirtyState) {
			const store = getCommentStore(
				this.commentManager,
				getCommentModelResourceName(this.model),
				this.model.id
			);
			if (store instanceof CommentStoreModel) {
				store.overviewNeedsRefresh = false;
			}

			this.emitReloadComments();
		}
	}

	open(comment: Comment) {
		CommentThreadModal.show({
			router: this.$router,
			model: this.model,
			commentId: comment.id,
			displayMode: this.displayMode,
		});
	}
}
</script>

<template>
	<div v-if="displayComments.length > 0" class="comment-overview sheet sheet-full">
		<!--
			Capture the click and prevent default so that no links within the content open up.
		-->
		<div v-for="comment of displayComments" :key="comment.id" class="-comment-container">
			<div
				class="-comment"
				@click.capture="
					$event.preventDefault();
					open(comment);
				"
			>
				<div class="-byline">
					<div class="-avatar">
						<AppUserCardHover :user="comment.user">
							<AppUserAvatarImg :user="comment.user" />
						</AppUserCardHover>
					</div>

					<strong>{{ comment.user.display_name }}</strong>
					<AppUserVerifiedTick :user="comment.user" />
					{{ ' ' }}
					<small class="text-muted">@{{ comment.user.username }}</small>
				</div>
				<AppFadeCollapse :collapse-height="150">
					<div class="-content">
						<AppContentViewer :source="comment.comment_content" />
					</div>
				</AppFadeCollapse>
			</div>
		</div>
	</div>
	<AppIllustration v-else-if="!hasComments" :asset="illNoCommentsSmall" sm>
		<AppTranslate v-if="displayMode === 'comments'">No comments yet.</AppTranslate>
		<AppTranslate v-else-if="displayMode === 'shouts'">No shouts yet.</AppTranslate>
	</AppIllustration>
</template>

<style lang="stylus" scoped>
.comment-overview .-comment-container:not(:last-child)
	border-bottom-width: $border-width-large
	border-bottom-style: solid
	border-color: var(--theme-bg-backdrop)
	// theme-prop('border-color', 'bg-subtle')

.-comment-container:last-child
	.-comment
		border-bottom-left-radius: $border-radius-large
		border-bottom-right-radius: $border-radius-large

.-comment-container:first-child
	.-comment
		border-top-left-radius: $border-radius-large
		border-top-right-radius: $border-radius-large

.-comment
	padding: 12px 8px

	&:hover
		change-bg('bg-offset')
		cursor: pointer

.-byline
	clearfix()
	text-overflow()
	margin-bottom: 12px
	line-height: 30px

.-avatar
	float: left
	margin-right: 8px
	width: 28px

.-content
	font-size: $font-size-small
</style>
