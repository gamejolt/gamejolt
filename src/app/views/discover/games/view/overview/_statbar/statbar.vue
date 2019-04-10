<template>
	<div
		class="-statbar"
		:class="{
			'-ratings-disabled': !game.ratings_enabled,
		}"
	>
		<div class="-stat">
			<div class="-label">
				<translate>views</translate>
			</div>
			<app-lazy-placeholder :when="isOverviewLoaded">
				<span class="lazy-placeholder"></span>
				<span class="-metric" :title="number(profileCount)">
					<strong>{{ fuzzynumber(profileCount) }}</strong>
				</span>
			</app-lazy-placeholder>
		</div>
		<template v-if="game.ratings_enabled">
			<a
				class="-stat"
				@click="showLikers()"
				v-app-tooltip="$gettext(`View all people that liked this game`)"
			>
				<div class="-label">
					<translate>likes</translate>
				</div>
				<app-lazy-placeholder :when="isOverviewLoaded">
					<span class="lazy-placeholder"></span>
					<span class="-metric" :title="number(likeCount)">
						<strong>{{ fuzzynumber(likeCount) }}</strong>
					</span>
				</app-lazy-placeholder>
			</a>
			<div class="-split" />
			<div class="-rating">
				<app-rating-widget :game="game" :user-rating="userRating" hide-count />
			</div>
		</template>
	</div>
</template>

<style lang="stylus" src="./statbar.styl" scoped></style>

<script lang="ts" src="./statbar"></script>
