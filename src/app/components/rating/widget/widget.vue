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
			<a
				v-if="game.like_count > 0"
				class="blip"
				:class="{ 'blip-active': userRating }"
				@click="showLikers()"
				v-app-tooltip="$gettext(`View all people that liked this game`)"
			>
				{{ formatFuzzynumber(game.like_count) }}
			</a>
			<span v-else class="blip-missing" />
		</template>
		<span v-else class="blip-missing" />

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

<script lang="ts" src="./widget"></script>
