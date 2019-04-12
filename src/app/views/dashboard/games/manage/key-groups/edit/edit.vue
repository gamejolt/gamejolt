<template>
	<section class="section" v-if="isRouteBootstrapped">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-7 col-lg-6">
					<h2 class="section-header">
						<translate>Edit Key Group</translate>
					</h2>

					<form-game-key-group :game="game" :packages="packages" :model="keyGroup" />
				</div>
				<div class="col-sm-10 col-md-4 col-md-offset-1 col-lg-5">
					<div class="alert" v-if="keyGroup.type === KeyGroup.TYPE_EMAIL">
						<p>
							<translate>
								You can hand out this URL for people to retrieve the keys attached to their email
								addresses.
							</translate>
						</p>
						<a :href="`${Environment.baseUrl}/claim/g-${game.id}`" target="_blank">
							{{ Environment.baseUrl }}/claim/g-{{ game.id }}
						</a>
					</div>
					<div class="alert" v-else-if="keyGroup.type === KeyGroup.TYPE_USER">
						<p v-translate>
							<b>Not so fast!</b>
							In order for the users in this key group to gain access, you'll need to email or
							message their keys to them. Copy each key page individually below, or export the full
							set to a CSV. Once they've received and claimed the key into their library, their
							claim date will appear in the table below.
						</p>
					</div>

					<h5>
						<strong><translate>Viewed</translate></strong>
					</h5>
					<p>
						{{ keyGroup.viewed_count || 0 | number }} / {{ keyGroup.key_count || 0 | number }}
						<small>
							({{
								(keyGroup.viewed_count / keyGroup.key_count)
									| number({ style: 'percent', maximumFractionDigits: 2 })
							}})
						</small>
					</p>

					<app-progress-bar thin :percent="(keyGroup.viewed_count / keyGroup.key_count) * 100" />

					<h5>
						<strong><translate>Claimed</translate></strong>
					</h5>
					<p>
						{{ keyGroup.claimed_count || 0 | number }} / {{ keyGroup.key_count || 0 | number }}
						<small>
							({{
								(keyGroup.claimed_count / keyGroup.key_count)
									| number({ style: 'percent', maximumFractionDigits: 2 })
							}})
						</small>
					</p>

					<app-progress-bar thin :percent="(keyGroup.claimed_count / keyGroup.key_count) * 100" />

					<hr />

					<div>
						<app-button block @click="removeGroup(keyGroup)">
							<translate>Remove Key Group</translate>
						</app-button>
					</div>
				</div>
			</div>

			<h2>
				<div class="section-header-controls">
					<app-button primary @click="isShowingAddKeys = !isShowingAddKeys">
						<translate>Add Keys</translate>
					</app-button>
					<app-button
						:href="`${Environment.baseUrl}/x/keys/export-csv/${game.id}/${keyGroup.id}`"
						target="_blank"
					>
						<translate>Export CSV</translate>
					</app-button>
				</div>

				<translate>Keys</translate>
			</h2>

			<app-expand :when="isShowingAddKeys" class="full-bleed-xs">
				<div class="well fill-offset">
					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
							<form-game-key-group-add-keys :keyGroup="keyGroup" @submit="onNewKeysAdded" />
						</div>
					</div>
				</div>
			</app-expand>

			<div class="well fill-offset full-bleed-xs">
				<form class="form-inline" @submit.prevent="searchKeys()">
					<div class="form-group">
						<input
							type="text"
							class="form-control"
							style="min-width: 250px"
							:placeholder="$gettext('Filter')"
							v-model="search.filter"
						/>
					</div>

					<app-button>
						<translate>Search</translate>
					</app-button>
				</form>
			</div>

			<div class="table-responsive">
				<table class="table table-hover">
					<thead>
						<tr>
							<th><translate>Key</translate></th>
							<th v-if="keyGroup.type === KeyGroup.TYPE_EMAIL"><translate>Email</translate></th>
							<th><translate>User</translate></th>
							<th><translate>Claimed On</translate></th>
							<th><translate>Last Viewed On</translate></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="key of keys" :key="key.id">
							<td>
								<code>{{ key.key }}</code>
								<a @click="copyKeyLink(key)" v-app-tooltip="$gettext(`Copy Key Page URL`)">
									<app-jolticon icon="link" />
								</a>
							</td>

							<td v-if="keyGroup.type === KeyGroup.TYPE_EMAIL">
								{{ key.email }}
							</td>

							<td>
								<template v-if="!!key.user_id">
									{{ key.username }}
								</template>
								<template v-else>
									-
								</template>
							</td>

							<td>
								<app-time-ago v-if="!!key.claimed_on" :date="key.claimed_on" />
								<template v-else>
									-
								</template>
							</td>

							<td>
								<app-time-ago v-if="!!key.viewed_on" :date="key.viewed_on" />
								<template v-else>
									-
								</template>
							</td>

							<td style="text-align: right">
								<app-button sm sparse trans icon="remove" @click="removeKey(key)" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./edit"></script>
