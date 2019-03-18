<template>
	<div class="game-collection-grid-item">
		<router-link :to="collection.routeLocation" v-app-track-event="eventLabel">
			<app-game-collection-thumbnail :collection="collection" />

			<div class="game-collection-title h4">
				<template v-if="collection.type === 'developer'">
					<span v-if="notOwner" v-translate="{ developer: '@' + collection.owner.username }">
						Games Made
						<small>by %{ developer }</small>
					</span>
					<translate v-else>
						Your Games
					</translate>
				</template>
				<template v-else-if="collection.type === 'followed'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Games Followed
						<small>by %{ user }</small>
					</span>
					<translate v-else>
						Your Followed Games
					</translate>
				</template>
				<template v-else-if="collection.type === 'owned'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Games Owned
						<small>by %{ user }</small>
					</span>
					<translate v-else>
						Your Owned Games
					</translate>
				</template>
				<template v-else-if="collection.type === 'recommended'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner.username }">
						Daily Mix
						<small>for %{ user }</small>
					</span>
					<translate v-else>
						Your Daily Mix
					</translate>
				</template>
				<template v-else>
					{{ collection.name }}
				</template>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-collection-grid-item
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm
		&:nth-child(odd)
			clear: both

	@media $media-md
		&:nth-child(odd)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	> a
		display: block

.game-collection-title
	margin: 0
	margin-top: $font-size-base

	a &
		color: $headings-color

	> small
		theme-prop('color', 'fg-muted')
</style>

<script lang="ts" src="./item" />
