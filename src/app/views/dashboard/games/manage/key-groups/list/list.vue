<template>
	<div class="route-manage-key-groups">
		<section class="section">
			<div class="container">
				<h2 class="section-header">
					<translate>Access Keys</translate>
				</h2>

				<div class="row">
					<div class="col-md-4 col-md-push-7">
						<div class="page-help" v-translate>
							<p>Manage access keys for your game through key groups.</p>
							<p>
								You can create different groups for different types of access, e.g. testers,
								friends, press, let's players, etc.
							</p>
							<p>They will be able to access your game's builds through the provided keys.</p>
						</div>
					</div>

					<div class="col-md-7 col-md-pull-4">
						<app-card-list :items="keyGroups" :is-adding="isAdding">
							<app-card-list-item v-for="group of keyGroups" :key="group.id" :item="group">
								<div class="row">
									<div class="col-sm-8">
										<div class="card-title">
											<h4>
												<router-link
													:to="{
														name: 'dash.games.manage.key-groups.edit',
														params: { keyGroupId: group.id },
													}"
												>
													{{ group.name }}
												</router-link>
											</h4>
										</div>

										<div class="card-meta">
											<span class="tag">
												<template v-if="group.type === KeyGroup.TYPE_ANONYMOUS">
													<translate>Unrestricted (Anonymous)</translate>
												</template>
												<template v-else-if="group.type === KeyGroup.TYPE_ANONYMOUS_CLAIM">
													<translate>Claim-Only</translate>
												</template>
												<template v-else-if="group.type === KeyGroup.TYPE_EMAIL">
													<translate>Unrestricted (Email)</translate>
												</template>
												<template v-else-if="group.type === KeyGroup.TYPE_USER">
													<translate>User</translate>
												</template>
											</span>
										</div>
									</div>
									<div class="col-sm-4">
										<hr class="visible-xs" />

										<div class="key-groups-progress small text-muted">
											<div>
												<strong><translate>Viewed</translate></strong>
												{{ group.viewed_count || 0 | number }} /
												{{ group.key_count || 0 | number }} ({{
													(group.viewed_count / group.key_count)
														| number({ style: 'percent', maximumFractionDigits: 2 })
												}})
											</div>
											<app-progress-bar
												thin
												:percent="(group.viewed_count / group.key_count) * 100"
											/>
											<br />

											<div>
												<strong><translate>Claimed</translate></strong>
												{{ group.claimed_count || 0 | number }} /
												{{ group.key_count || 0 | number }} ({{
													(group.claimed_count / group.key_count)
														| number({ style: 'percent', maximumFractionDigits: 2 })
												}})
											</div>
											<app-progress-bar
												thin
												:percent="(group.claimed_count / group.key_count) * 100"
											/>
										</div>
									</div>
								</div>

								<div class="card-controls">
									<app-button
										primary
										:to="{
											name: 'dash.games.manage.key-groups.edit',
											params: { keyGroupId: group.id },
										}"
									>
										<translate>Manage</translate>
									</app-button>
								</div>
							</app-card-list-item>

							<app-card-list-add :label="$gettext('Add Key Group')" @toggle="isAdding = !isAdding">
								<form-game-key-group :game="game" :packages="packages" @submit="onKeyGroupAdded" />
							</app-card-list-add>
						</app-card-list>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.key-groups-progress

	@media $media-sm-up
		text-align: right

	.progress
		margin: 5px 0
</style>

<script lang="ts" src="./list"></script>
