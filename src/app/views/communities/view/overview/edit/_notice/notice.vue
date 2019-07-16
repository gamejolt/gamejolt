<template>
	<div v-if="!!community.game" class="well fill-offset -notice">
		<span v-translate="{ game: community.game.title }" class="-main-notice">
			<app-jolticon icon="notice" notice />
			<strong>Some aspects of this community are synced with the game %{ game }:</strong>
			<br />
			<code>Name</code>
			,
			<code>Url Path</code>
			,
			<code>Theme</code>
			,
			<code>Header</code>
		</span>
		<div v-translate>
			To edit them, visit the
			<router-link
				:to="{
					name: 'dash.games.manage.game.overview',
					params: {
						id: community.game.id,
					},
				}"
			>
				game's dashboard.
			</router-link>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	margin-bottom: ($line-height-computed / 2)

.-main-notice
	display: block
	margin-bottom: ($line-height-computed / 2)
</style>

<script lang="ts" src="./notice"></script>
