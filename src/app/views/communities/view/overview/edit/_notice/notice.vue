<template>
	<div v-if="!!community.game" class="well fill-offset -notice">
		<div class="-main-notice">
			<app-jolticon icon="notice" notice />
			<strong v-translate="{ game: community.game.title }">
				Some aspects of this community are synced with the game %{ game }:
			</strong>
			<br />
			<code><translate>Name</translate></code>
			<code><translate>Url Path</translate></code>
			<code><translate>Theme</translate></code>
			<code><translate>Header</translate></code>
		</div>
		<div>
			<translate>
				You can edit them on the game's dashboard.
			</translate>
			<router-link
				:to="{
					name: 'dash.games.manage.game.overview',
					params: {
						id: community.game.id,
					},
				}"
			>
				<app-button sm>
					<translate>Go to Dashboard</translate>
				</app-button>
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
	margin-bottom: ($line-height-computed / 2)
</style>

<script lang="ts" src="./notice"></script>
