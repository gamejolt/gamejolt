<script lang="ts" src="./controls"></script>

<template>
	<span class="comment-controls">
		<span v-app-auth-required>
			<app-button
				v-app-tooltip="votingTooltip"
				v-app-track-event="`comment-widget:vote-click`"
				icon="thumbs-up"
				circle
				trans
				:primary="hasUpvote"
				:solid="hasUpvote"
				@click="onUpvoteClick()"
			/>

			<a
				v-if="comment.votes > 0"
				v-app-tooltip="$gettext(`View all people that liked this comment`)"
				class="blip"
				:class="{ 'blip-active': comment.user_vote, mobile: Screen.isXs }"
				@click="showLikers()"
			>
				{{ fuzzynumber(comment.votes) }}
			</a>
			<span v-else class="blip-missing" />

			<app-button
				v-app-track-event="`comment-widget:vote-click`"
				icon="thumbs-down"
				circle
				trans
				:primary="hasDownvote"
				:solid="hasDownvote"
				@click="onDownvoteClick()"
			/>

			<app-button
				v-if="canPlaceStickers"
				v-app-tooltip="$gettext('Place Sticker')"
				v-app-track-event="`comment-widget:place-sticker`"
				v-app-auth-required
				class="-control-margin"
				icon="sticker"
				circle
				trans
				@click="placeSticker()"
			/>
		</span>

		<template v-if="showReply">
			<span v-if="canReply" v-app-auth-required>
				<app-button
					v-app-tooltip="$gettext(`Reply`)"
					v-app-track-event="`comment-widget:reply-click`"
					class="-control-margin"
					icon="reply"
					circle
					trans
					@click="onReplyClick(true)"
				/>
			</span>
			<app-button
				v-if="childrenCount > 0"
				class="-replies"
				trans
				@click="onReplyClick(false)"
			>
				<translate
					:translate-n="childrenCount"
					:translate-params="{ count: childrenCount }"
					translate-plural="+ %{ count } replies"
				>
					+ %{ count } reply
				</translate>
			</app-button>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-control-margin
	margin-left: 8px

.-replies
	@media $media-xs
		margin-top: 8px
		margin-left: -6px
		display: block
</style>
