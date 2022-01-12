<script lang="ts" src="./trophies"></script>

<template>
	<div class="row">
		<div class="col-md-10 col-lg-9">
			<h2 class="section-header">
				<translate>dash.games.trophies.heading</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						The API lets you add multiple unique trophies, each forged from a material
						that indicates how difficult it is to achieve: bronze (easiest), silver,
						gold, or platinum (hardest).
					</translate>
				</p>
				<p>
					<app-link-help page="dev-trophies" class="link-help">
						<translate>dash.games.trophies.page_help_link</translate>
					</app-link-help>
				</p>
			</div>

			<div v-if="hasHiddenTrophies" class="alert alert-notice">
				<p v-translate>
					<strong>You have hidden trophies!</strong>
					Be sure to unhide them when you're ready for players to achieve them.
				</p>
			</div>

			<div v-for="difficulty of GameTrophy.difficulties" :key="difficulty">
				<h4>
					<translate :translate-params="{ difficulty: trophyLabels[difficulty] }">
						%{ difficulty } Trophies
					</translate>
				</h4>

				<p v-if="!groupedTrophies[difficulty].length" class="text-muted small">
					<translate> No trophies added yet for this difficulty level. </translate>
				</p>

				<app-card-list
					:items="groupedTrophies[difficulty]"
					:active-item="activeItem[difficulty]"
					:is-adding="isAdding[difficulty]"
					is-draggable
					@activate="activeItem[difficulty] = $event"
				>
					<app-card-list-draggable
						item-key="id"
						@change="saveTrophySort(difficulty, $event)"
					>
						<template #item="{ element: trophy }">
							<app-card-list-item
								:id="`trophy-container-${trophy.id}`"
								:item="trophy"
							>
								<div class="row">
									<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
										<app-trophy-thumbnail :trophy="trophy" no-highlight />

										<br class="visible-xs" />
									</div>
									<div class="col-xs-12 col-sm-10">
										<a class="card-remove" @click.stop="removeTrophy(trophy)">
											<app-jolticon icon="remove" />
										</a>

										<div class="card-stats">
											<div class="stat-big">
												<div class="stat-big-label">
													<translate>
														dash.games.trophies.trophy_id_label
													</translate>
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

										<div
											v-if="!trophy.visible || trophy.secret"
											class="card-meta"
										>
											<span
												v-if="!trophy.visible"
												v-app-tooltip="
													$gettext(`dash.games.trophies.hidden_tooltip`)
												"
												class="tag tag-notice"
											>
												<translate>
													dash.games.trophies.hidden_tag
												</translate>
											</span>
											<span
												v-if="trophy.secret"
												v-app-tooltip="
													$gettext(`dash.games.trophies.secret_tooltip`)
												"
												class="tag"
											>
												<translate>
													dash.games.trophies.secret_tag
												</translate>
											</span>
										</div>
									</div>
								</div>

								<template #body>
									<form-game-trophy
										:game="game"
										:model="trophy"
										@submit="onTrophyEdited"
									/>
								</template>
							</app-card-list-item>
						</template>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext('New Trophy')"
						@toggle="isAdding[difficulty] = !isAdding[difficulty]"
					>
						<form-game-trophy
							:game="game"
							:difficulty="difficulty"
							@submit="onTrophyAdded"
						/>
					</app-card-list-add>
				</app-card-list>
			</div>
		</div>
	</div>
</template>
