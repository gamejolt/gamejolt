<template>
	<!--
		We don't want it clicking into the post when clicking a control.
	-->
	<span @click.stop>
		<app-fireside-post-like-widget :post="post" :show-user-follow="showUserFollow" trans />

		&nbsp;

		<template v-if="!showComments">
			<app-button
				icon="comment"
				circle
				trans
				@click="openComments()"
				v-app-tooltip="$gettext('View Comments')"
			/>

			<span class="blip" v-if="commentsCount > 0">
				<span class="blip-caret"></span>
				<span class="blip-count">
					{{ commentsCount | number }}
				</span>
			</span>

			&nbsp;
		</template>

		<app-popper @show="isShowingShare = true" @hide="isShowingShare = false">
			<app-button icon="share-airplane" circle trans v-app-tooltip="$gettext('Share')" />

			<div slot="popover" class="well fill-darkest sans-margin" v-if="isShowingShare">
				<div class="social-widgets" v-if="!GJ_IS_CLIENT">
					<app-social-twitter-share :url="shareUrl" :content="post.leadStr" />

					<span class="dot-separator"></span>

					<app-social-facebook-like :url="shareUrl" />
				</div>

				<app-button block @click="copyShareUrl">
					<translate>Copy Permalink</translate>
				</app-button>
			</div>
		</app-popper>

		<div v-if="!showComments" class="-inline-comment" v-app-auth-required>
			<app-event-item-controls-comment-add-placeholder
				v-if="!clickedComment"
				@click="onClickCommentAddPlaceholder"
			/>
			<form-comment
				v-else
				resource="Fireside_Post"
				:resource-id="post.id"
				:editor-startup-activity="clickedCommentType"
				autofocus
				@submit="onSubmitNewComment"
			/>
		</div>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-inline-comment
	margin-top: ($grid-gutter-width / 2)
</style>

<script lang="ts" src="./fireside-post"></script>
