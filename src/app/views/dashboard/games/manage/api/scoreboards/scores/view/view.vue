<template>
	<div v-if="isRouteBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<app-button sparse icon="remove" @click="removeScore" />
			</div>

			<translate>dash.games.scores.view.heading</translate>
		</h2>

		<div class="table-responsive">
			<table class="table">
				<colgroup>
					<col class="col-sm-3 col-lg-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							<translate>dash.games.scores.view.user_label</translate>
						</th>
						<td>
							<!-- User Score -->
							<router-link
								v-if="score.user_id"
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.user',
									params: { table: score.table_id, user: score.user.id },
								}"
							>
								{{ score.user.display_name }}
							</router-link>

							<!-- Guest Score -->
							<span v-else>
								{{ score.guest }}
								<br />
								<small class="text-muted">
									<translate>dash.games.scores.guest_tag</translate>
								</small>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.table_label</translate>
						</th>
						<td>
							<router-link
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.list',
									params: { table: scoreTable.id },
								}"
							>
								{{ scoreTable.name }}
							</router-link>
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.string_label</translate>
						</th>
						<td>{{ score.score }}</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.sort_label</translate>
						</th>
						<td>{{ score.sort | number }}</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.date_label</translate>
						</th>
						<td>
							{{ score.logged_on | date('medium') }}
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.data_label</translate>
						</th>
						<td>
							<pre v-if="score.extra_data" class="small">
							{{ score.extra_data }}
						</pre
							>
							<span v-else class="small text-muted">
								<translate>dash.games.scores.view.data_none_help</translate>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" src="./view"></script>
