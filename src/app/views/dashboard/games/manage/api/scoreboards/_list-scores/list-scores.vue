<template>
	<div class="table-responsive">
		<table class="table table-condensed">
			<thead>
				<tr>
					<th v-if="!isForUser">
						<translate>dash.games.scores.list.rank_label</translate>
					</th>
					<th>
						<translate>Score</translate>
					</th>
					<th v-if="!isForUser">
						<translate>dash.games.scores.list.user_label</translate>
					</th>
					<th>
						<translate>dash.games.scores.list.date_label</translate>
					</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(score, i) of scores" :key="score.id">
					<td v-if="!isForUser">
						<strong>{{ i + 1 }}</strong>
					</td>
					<td>
						<router-link
							:to="{
								name: 'dash.games.manage.api.scoreboards.scores.view',
								params: { score: score.id },
							}"
							class="table-primary-link"
						>
							{{ score.sort | number }}
						</router-link>
					</td>
					<td v-if="!isForUser">
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
					<td class="small">
						{{ score.logged_on | date('medium') }}
					</td>
					<td class="text-right">
						<div class="table-controls">
							<app-popper>
								<a class="text-muted">
									<app-jolticon icon="cog" />
								</a>

								<div slot="popover" class="list-group list-group-dark nowrap">
									<a class="list-group-item has-icon" @click="removeScore(score)">
										<app-jolticon icon="remove" notice />
										<translate>dash.games.scores.list.remove_button</translate>
									</a>
								</div>
							</app-popper>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts" src="./list-scores" />
