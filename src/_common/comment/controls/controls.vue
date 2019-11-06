<template>
	<span class="comment-controls">
		<span v-app-auth-required>
			<app-button
				icon="thumbs-up"
				circle
				trans
				:primary="hasUpvote"
				:solid="hasUpvote"
				@click="onUpvoteClick()"
				v-app-tooltip="votingTooltip"
				v-app-track-event="`comment-widget:vote-click`"
			/>

			<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this comment`)">
				<span
					v-if="comment.votes > 0"
					class="blip"
					:class="{
						filled: hasUpvote,
					}"
				>
					<span class="blip-caret"></span>
					<span class="blip-count">{{ comment.votes | number }}</span>
				</span>
			</a>

			&nbsp;

			<app-button
				icon="thumbs-down"
				circle
				trans
				:primary="hasDownvote"
				:solid="hasDownvote"
				@click="onDownvoteClick()"
				v-app-track-event="`comment-widget:vote-click`"
			/>
		</span>

		<template v-if="showReply">
			&nbsp;

			<span v-app-auth-required>
				<app-button
					icon="reply"
					circle
					trans
					@click="onReplyClick(true)"
					v-app-tooltip="$gettext(`Reply`)"
					v-app-track-event="`comment-widget:reply-click`"
				/>
			</span>

			<app-button v-if="children && children.length" trans @click="onReplyClick(false)">
				<translate
					:translate-n="children.length"
					:translate-params="{ count: children.length }"
					translate-plural="+ %{ count } replies"
				>
					+ %{ count } reply
				</translate>
			</app-button>
		</template>
	</span>
</template>

<script lang="ts" src="./controls"></script>
