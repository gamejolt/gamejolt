<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.scores.list.heading</translate>
		</h2>

		<div class="row">
			<div class="col-md-10 col-lg-9">
				<div class="form-group">
					<select class="form-control" v-model="selectedTable" @change="changeTable">
						<option
							v-for="table of scoreTables"
							:key="table.id"
							:selected="table.id === selectedTable"
							:value="table.id"
						>
							{{ table.name }}
						</option>
					</select>
				</div>
			</div>
		</div>

		<div class="page-help" key="page-help">
			<p>
				<translate>
					These are all of the scores that have been submitted to this scoreboard by users and
					guests (if allowed).
				</translate>
			</p>
		</div>

		<div class="alert alert-notice anim-fade-in" key="no-scores" v-if="!scores.length">
			<p><translate>This table lacks scores, alas.</translate></p>
		</div>

		<app-manage-game-list-scores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			@remove="onScoreRemoved"
		/>
	</div>
</template>

<script lang="ts" src="./list" />
