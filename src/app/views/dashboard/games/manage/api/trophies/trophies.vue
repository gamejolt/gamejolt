<template>
	<div class="row">
		<div class="col-md-10 col-lg-9">
			<h2 class="section-header">
				<translate>dash.games.trophies.heading</translate>
			</h2>

			<div class="page-help">
				<div v-translate>
					dash.games.trophies.page_help_html
				</div>
				<p>
					<a class="link-help" href="https://help.gamejolt.com/dev-trophies" target="_blank">
						<translate>dash.games.trophies.page_help_link</translate>
					</a>
				</p>
			</div>

			<div class="alert alert-notice" v-if="hasHiddenTrophies" v-translate>
				dash.games.trophies.has_hidden_html
			</div>

			<div v-for="difficulty of GameTrophy.difficulties">
				<h4>
					<translate :translate-params="{ difficulty: trophyLabels[difficulty] }">
						%{ difficulty } Trophies
					</translate>
				</h4>

				<p class="text-muted small" v-if="!groupedTrophies[difficulty].length">
					<translate>
						No trophies added yet for this difficulty level.
					</translate>
				</p>

				<app-card-list
					:items="groupedTrophies[difficulty]"
					:active-item="activeItem[difficulty]"
					:is-adding="isAdding[difficulty]"
					@activate="activeItem[difficulty] = $event"
				>
					<app-card-list-draggable @change="saveTrophySort(difficulty, $event)">
						<app-card-list-item
							v-for="trophy of groupedTrophies[difficulty]"
							:key="trophy.id"
							:id="`trophy-container-${trophy.id}`"
							:item="trophy"
						>
							<div class="row">
								<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
									<app-trophy-thumbnail :trophy="trophy" />

									<br class="visible-xs" />
								</div>
								<div class="col-xs-12 col-sm-10">
									<a class="card-remove" @click.stop="removeTrophy(trophy)">
										<app-jolticon icon="remove" />
									</a>

									<div class="card-stats">
										<div class="stat-big">
											<div class="stat-big-label">
												<translate>dash.games.trophies.trophy_id_label</translate>
											</div>
											<div class="stat-big-digit">
												{{ trophy.id }}
											</div>
										</div>
									</div>

									<div class="card-title">
										<h5>{{ trophy.title }}</h5>
									</div>

									<div class="card-content">
										{{ trophy.description }}
									</div>

									<div class="card-meta" v-if="!trophy.visible || trophy.secret">
										<span
											v-if="!trophy.visible"
											class="tag tag-notice"
											v-app-tooltip="$gettext(`dash.games.trophies.hidden_tooltip`)"
										>
											<translate>dash.games.trophies.hidden_tag</translate>
										</span>
										<span
											v-if="trophy.secret"
											class="tag"
											v-app-tooltip="$gettext(`dash.games.trophies.secret_tooltip`)"
										>
											<translate>dash.games.trophies.secret_tag</translate>
										</span>
									</div>
								</div>
							</div>

							<template slot="body">
								<form-game-trophy :game="game" :model="trophy" @submit="onTrophyEdited" />
							</template>
						</app-card-list-item>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext('New Trophy')"
						@toggle="isAdding[difficulty] = !isAdding[difficulty]"
					>
						<form-game-trophy :game="game" :difficulty="difficulty" @submit="onTrophyAdded" />
					</app-card-list-add>
				</app-card-list>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./trophies" />
