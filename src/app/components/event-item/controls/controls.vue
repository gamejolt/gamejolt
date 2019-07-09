<template>
	<div>
		<div class="event-item-controls">
			<template v-if="post && post.status === FiresidePost.STATUS_ACTIVE">
				<!--
					We don't want it clicking into the post when clicking a control.
				-->
				<div @click.stop class="-controls-container">
					<span class="-side-control">
						<app-fireside-post-like-widget :post="post" :show-user-follow="showUserFollow" circle />
					</span>

					&nbsp;

					<template v-if="!showComments">
						<div class="-comment-form-container">
							<app-event-item-controls-comment-add-placeholder
								v-if="!clickedComment"
								@click="onClickCommentAddPlaceholder"
							/>
							<form-comment
								v-else
								resource="Fireside_Post"
								:resource-id="post.id"
								autofocus
								:open-gif-startup="openGifModal"
								@submit="onSubmitNewComment"
							/>
						</div>

						<span class="-side-control">
							<app-button
								icon="comment"
								circle
								@click="openComments()"
								v-app-tooltip="$gettext('View Comments')"
							/>

							<span class="blip filled" v-if="commentsCount > 0">
								<span class="blip-caret"></span>
								<span class="blip-count">
									{{ commentsCount | number }}
								</span>
							</span>
						</span>
					</template>
				</div>
			</template>
			<template v-else-if="video">
				<!--
					We don't want it clicking into the post when clicking a control.
				-->
				<span @click.stop>
					<app-comment-video-like-widget :video="video" circle />
				</span>
			</template>
		</div>

		<template v-if="post && showComments">
			<br />
			<br />

			<app-comment-widget resource="Fireside_Post" :resource-id="post.id" @add="onCommentAdded()" />
		</template>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
