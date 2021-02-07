<script lang="ts" src="./entries"></script>

<template>
	<div>
		<h2 class="sans-margin-top"><translate>Manage Jam Entries</translate></h2>

		<template v-if="isLoading">
			<app-loading centered />
		</template>
		<template v-else-if="competition.periodNum === CompetitionPeriodPreComp">
			<p>
				<translate>
					The Jam has not yet begun and has no entries. Check back later when the jam has
					started.
				</translate>
			</p>
			<p class="help-block">
				<translate>The Jam starts on:</translate>

				<app-community-competition-date
					:date="competition.starts_on"
					:timezone="competition.timezone"
				/>
			</p>
		</template>
		<template v-else>
			<template v-if="entryCount === 0">
				<app-illustration src="~img/ill/no-comments-small.svg">
					<p>
						<translate v-if="competition.periodNum >= CompetitionPeriodVoting">
							No new entries can be submitted to the Jam, and none have been submitted
							during its runtime.
						</translate>
						<translate v-else>
							There are currently no submissions entered into the jam yet. Once they
							are entered, they will show up here.
						</translate>
					</p>
				</app-illustration>
			</template>

			<template v-else>
				<p class="help-block">
					<span v-translate="{ count: entryCount }">
						<b>%{ count }</b> total entries have been submitted.
					</span>
					<template v-if="entryCount > competition.entry_count">
						<br />
						<span
							v-translate="{
								count: entryCount - competition.entry_count,
								visibleCount: competition.entry_count,
							}"
						>
							<b>%{ count }</b> have been hidden, resulting in
							<b>%{ visibleCount }</b> visible entries.
						</span>
					</template>
				</p>

				<div class="table-responsive">
					<table class="table">
						<thead>
							<tr>
								<th>
									<router-link
										v-app-no-autoscroll
										:to="getSortLocation('name')"
										class="link-unstyled -header"
									>
										<span><translate>Title</translate></span>
										<span v-if="currentSort === 'name'">
											<app-jolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</router-link>
								</th>
								<th>
									<router-link
										v-app-no-autoscroll
										:to="getSortLocation('user')"
										class="link-unstyled -header"
									>
										<span><translate>Developer</translate></span>
										<span v-if="currentSort === 'user'">
											<app-jolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</router-link>
								</th>
								<th>
									<router-link
										v-app-no-autoscroll
										:to="getSortLocation('time')"
										class="link-unstyled -header"
									>
										<span><translate>Entered</translate></span>
										<span v-if="currentSort === 'time'">
											<app-jolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</router-link>
								</th>
								<th>
									<router-link
										v-app-no-autoscroll
										:to="getSortLocation('visibility')"
										class="link-unstyled -header"
									>
										<span><translate>Visibility</translate></span>
										<span v-if="currentSort === 'visibility'">
											<app-jolticon
												v-app-tooltip="sortDirectionLabel"
												:icon="sortIcon"
											/>
										</span>
									</router-link>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="entry of entries" :key="entry.id">
								<td>
									<a @click="onClickShowEntry(entry)">
										{{ entry.resource.title }}
									</a>
								</td>
								<td>
									<router-link
										:to="{
											name: 'profile.overview',
											params: { username: entry.resource.developer.username },
										}"
										class="-user-link"
									>
										<app-user-card-hover :user="entry.resource.developer">
											<span class="-user-link">
												<app-user-avatar-img
													class="-avatar"
													:user="entry.resource.developer"
												/>
												<span class="-user-link-name">
													@{{ entry.resource.developer.username }}
												</span>
												&nbsp;
												<app-user-verified-tick
													:user="entry.resource.developer"
												/>
											</span>
										</app-user-card-hover>
									</router-link>
								</td>
								<td>
									<app-time-ago :date="entry.added_on" />
								</td>
								<td>
									<app-button
										v-app-tooltip="
											entry.is_removed
												? $gettext(`Readmit entry into the Jam`)
												: $gettext(`Hide entry from the Jam`)
										"
										sm
										:icon="entry.is_removed ? 'active' : 'inactive'"
										@click="onClickRemoveEntry(entry)"
									>
										<translate v-if="entry.is_removed">Readmit Entry</translate>
										<translate v-else>Hide Entry</translate>
									</app-button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<app-pagination
					:total-items="entryCount"
					:current-page="currentPage"
					:items-per-page="perPage"
				/>

				<!-- Probably on a too high page due to editing url. -->
				<template v-if="entryCount > 0 && entries.length === 0">
					<h4>
						<translate>Whoops! There are no entries back here...</translate>
					</h4>
					<app-button :to="getFirstPageLocation()" icon="reply">
						<translate>Go back</translate>
					</app-button>
				</template>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-header
	text-decoration: none

	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center
	max-width: 184px

	&-name
		text-overflow()

.-avatar
	flex: none
	display: inline-block
	width: $line-height-computed
	height: $line-height-computed
	margin-right: 6px
</style>
