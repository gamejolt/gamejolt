<script lang="ts" src="./controls"></script>

<template>
	<div>
		<app-event-item-controls-overlay class="event-item-controls" end>
			<template v-if="post">
				<app-event-item-controls-fireside-post
					:post="post"
					:show-comments-button="!showCommentFeed"
					:comments-count="commentsCount"
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
		</app-event-item-controls-overlay>

		<app-event-item-controls-user-follow
			v-if="post"
			:post="post"
			:should-show="isShowingFollow"
			@close="onUserFollowDismissal"
		/>
		<span @click.stop>
			<app-event-item-controls-comments
				v-if="post"
				:model="post"
				:show-feed="showCommentFeed"
				:event-label="eventLabel"
				@count="commentsCount = $event"
			/>
		</span>
	</div>
</template>
