<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.scoreboards.heading</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					The API allows you to add multiple customized scoreboards, with control over sorting
					options and guest scoring, and the ability to attach extra hidden data to scores.
				</translate>
			</p>
			<p>
				<translate>
					The primary scoreboard is the one that will show by default on your game's page. Set a new
					primary by dragging a scoreboard into the first slot.
				</translate>
			</p>
			<p>
				<a class="link-help" href="https://help.gamejolt.com/dev-scoreboards" target="_blank">
					<translate>dash.games.scoreboards.page_help_link</translate>
				</a>
			</p>
		</div>

		<div class="row">
			<div class="col-md-10 col-lg-9">
				<app-card-list
					:items="scoreTables"
					:active-item="activeItem"
					:is-adding="isAdding"
					@activate="activeItem = $event"
				>
					<app-card-list-draggable @change="saveSort">
						<app-card-list-item
							v-for="(scoreTable, i) of scoreTables"
							:key="scoreTable.id"
							:item="scoreTable"
						>
							<!--
							Can only remove if there is more than one score table left.
						-->
							<a
								class="card-remove"
								v-if="scoreTables.length > 1"
								@click.stop="removeTable(scoreTable)"
							>
								<app-jolticon icon="remove" />
							</a>

							<div class="card-stats">
								<div class="stat-big">
									<div class="stat-big-label">
										<translate>dash.games.scoreboards.table_id_label</translate>
									</div>
									<div class="stat-big-digit">{{ scoreTable.id }}</div>
								</div>
							</div>

							<div class="card-title">
								<h4>
									{{ scoreTable.name }}
								</h4>
							</div>

							<div class="card-meta">
								<span
									class="tag tag-highlight"
									v-if="i === 0"
									v-app-tooltip="$gettext(`dash.games.scoreboards.primary_tooltip`)"
								>
									<translate>dash.games.scoreboards.primary_tag</translate>
								</span>
								<span
									class="tag"
									v-if="scoreTable.allow_guest_scores"
									v-app-tooltip="$gettext(`dash.games.scoreboards.guest_tooltip`)"
								>
									<translate>dash.games.scoreboards.guest_tag</translate>
								</span>
								<span
									class="tag"
									v-if="scoreTable.unique_scores"
									v-app-tooltip="$gettext(`dash.games.scoreboards.unique_tooltip`)"
								>
									<translate>dash.games.scoreboards.unique_tag</translate>
								</span>
								<span
									class="tag"
									v-if="
										scoreTable.scores_sorting_direction === GameScoreTable.SORTING_DIRECTION_ASC
									"
									v-app-tooltip="$gettext(`dash.games.scoreboards.asc_tooltip`)"
								>
									<translate>dash.games.scoreboards.asc_tag</translate>
								</span>
								<span
									class="tag"
									v-if="
										scoreTable.scores_sorting_direction === GameScoreTable.SORTING_DIRECTION_DESC
									"
									v-app-tooltip="$gettext(`dash.games.scoreboards.desc_tooltip`)"
								>
									<translate>dash.games.scoreboards.desc_tag</translate>
								</span>
							</div>

							<div class="card-content">
								{{ scoreTable.description }}
							</div>

							<div class="card-controls">
								<!-- Don't propagate the click so that it doesn't open the accordion item. -->
								<app-button
									:to="{
										name: 'dash.games.manage.api.scoreboards.scores.list',
										params: { table: scoreTable.id },
									}"
									@click.native.stop
								>
									<translate>dash.games.scoreboards.scores_button</translate>
								</app-button>
							</div>

							<template slot="body">
								<form-game-score-table :game="game" :model="scoreTable" @submit="onTableEdited" />
							</template>
						</app-card-list-item>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext(`dash.games.scoreboards.add_button`)"
						@toggle="isAdding = !isAdding"
					>
						<form-game-score-table :game="game" @submit="onTableAdded" />
					</app-card-list-add>
				</app-card-list>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./list"></script>
