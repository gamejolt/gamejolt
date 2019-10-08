<template>
	<div>
		<div class="event-item-controls">
			<template v-if="post">
				<app-event-item-controls-fireside-post
					:post="post"
					:show-user-follow="showUserFollow"
					:show-comments="showComments"
					@edit="emitPostEdit"
					@publish="emitPostPublish"
					@remove="emitPostRemove"
					@feature="emitPostFeature"
					@unfeature="emitPostUnfeature"
					@move-channel="emitPostMoveChannel"
					@reject="emitPostReject"
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

		<template v-if="post && showComments">
			<br />
			<br />

			<app-comment-widget resource="Fireside_Post" :resource-id="post.id" />
		</template>
	</div>
</template>

<script lang="ts" src="./controls"></script>
