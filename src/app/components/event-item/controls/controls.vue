<template>
	<div>
		<div class="event-item-controls">
			<template v-if="post && post.status === FiresidePost.STATUS_ACTIVE">
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
				</span>
			</template>
			<template v-else-if="video">
				<!--
					We don't want it clicking into the post when clicking a control.
				-->
				<span @click.stop>
					<app-comment-video-like-widget :video="video" trans />
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

<script lang="ts" src="./controls"></script>
