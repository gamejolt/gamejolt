<template>
	<div v-if="isRouteBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<app-button
					sparse
					icon="remove"
					@click="removeAll"
					v-app-tooltip="$gettext(`Remove All Scores`)"
				/>
			</div>

			<translate>dash.games.scores.user.list.heading</translate>
			<small>
				<translate>dash.games.scores.user.list.heading_for</translate>
				<router-link class="link-unstyled" :to="user.url">
					<strong>{{ user.display_name }}</strong>
				</router-link>
				<translate>dash.games.scores.user.list.heading_on</translate>
				<router-link
					class="link-unstyled"
					:to="{
						name: 'dash.games.manage.api.scoreboards.scores.list',
						params: { table: scoreTable.id },
					}"
				>
					<strong>{{ scoreTable.name }}</strong>
				</router-link>
			</small>
		</h2>

		<div class="alert alert-notice anim-fade-in" v-if="!scores.length">
			<p>
				<translate>The user has no scores on this scoreboard.</translate>
			</p>
		</div>

		<app-manage-game-list-scores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			:is-for-user="true"
			@remove="onScoreRemoved"
		/>
	</div>
</template>

<script lang="ts" src="./user" />
