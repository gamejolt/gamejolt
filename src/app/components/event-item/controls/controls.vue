<template>
	<div>
		<div class="event-item-controls">
			<template v-if="post">
				<app-event-item-controls-fireside-post
					:post="post"
					:show-comments-button="!showCommentFeed"
					:comments-count="commentsCount"
					@edit="emitPostEdit"
					@publish="emitPostPublish"
					@remove="emitPostRemove"
					@feature="emitPostFeature"
					@unfeature="emitPostUnfeature"
					@move-channel="emitPostMoveChannel"
					@reject="emitPostReject"
					@pin="emitPostPin"
					@unpin="emitPostUnpin"
					@show-user-follow="toggleUserFollow = $event"
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
		</div>

		<!-- v-if="showUserFollow" -->
		<app-expand v-if="showUserFollow" when animate-initial>
			<app-event-item-controls-user-follow :post="post" :toggle-user-follow="toggleUserFollow" />
		</app-expand>
		<span @click.stop>
			<app-event-item-controls-comments
				v-if="post"
				:model="post"
				:show-feed="showCommentFeed"
				@count="commentsCount = $event"
			/>
		</span>
	</div>
</template>

<script lang="ts" src="./controls"></script>
