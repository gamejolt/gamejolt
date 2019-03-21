<template>
	<div class="rating-widget">
		<span v-app-auth-required>
			<app-button
				class="-like-button"
				icon="thumbs-up"
				circle
				trans
				:primary="hasLiked"
				:solid="hasLiked"
				@click="like()"
			/>
		</span>

		<template v-if="!hideCount">
			<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this game`)">
				<span class="blip filled" v-if="game.like_count > 0">
					<span class="blip-caret"></span>
					<span class="blip-count">{{ likeCountFormatted }}</span>
				</span>
			</a>

			&nbsp;
		</template>

		<span v-app-auth-required>
			<app-button
				icon="thumbs-down"
				circle
				trans
				:primary="hasDisliked"
				:solid="hasDisliked"
				@click="dislike()"
			/>
		</span>
	</div>
</template>

<script lang="ts" src="./widget" />

<style lang="stylus" scoped>
.-like-button {
  margin-right: 10px;
}
</style>
