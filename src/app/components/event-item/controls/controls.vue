<script lang="ts" src="./controls"></script>

<template>
	<div>
		<app-sticker-controls-overlay class="event-item-controls" end>
			<template v-if="post">
				<app-event-item-controls-fireside-post
					:post="post"
					:show-comments-button="showComments"
					:event-label="eventLabel"
					@edit="emitPostEdit"
					@publish="emitPostPublish"
					@remove="emitPostRemove"
					@feature="emitPostFeature"
					@unfeature="emitPostUnfeature"
					@move-channel="emitPostMoveChannel"
					@reject="emitPostReject"
					@pin="emitPostPin"
					@unpin="emitPostUnpin"
					@like-change="setUserFollow"
					@sticker="emitSticker"
				/>
			</template>
			<template v-else-if="video">
				<!--
					We don't want it clicking into the post when clicking a control.
				-->
				<span @click.stop>
					<app-comment-video-like-widget :video="video" trans />
				</span>
			</template>
		</app-sticker-controls-overlay>

		<app-event-item-controls-user-follow
			v-if="post"
			:post="post"
			:should-show="isShowingFollow"
			@close="onUserFollowDismissal"
		/>
	</div>
</template>
