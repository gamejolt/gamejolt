<script lang="ts" src="./blocks"></script>

<template>
	<app-communities-view-page-container full>
		<h2 class="section-header">
			<translate>Blocked Users</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					Block users from contributing to this community. They will not be able to join
					or post.
				</translate>
			</p>
		</div>

		<app-card-list :is-adding="isAdding">
			<app-card-list-add :label="$gettext('Block User')" @toggle="isAdding = !isAdding">
				<form-community-block :community="community" @submit="onBlockSubmit" />
			</app-card-list-add>
		</app-card-list>
		<div class="table-responsive">
			<table v-if="hasBlocks" class="table">
				<thead>
					<tr>
						<th class="-header" @click="changeSort('name')">
							<translate>Blocked user</translate>
							<span v-if="sort === 'name'">
								<app-jolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocker')">
							<translate>Issued by</translate>
							<span v-if="sort === 'blocker'">
								<app-jolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocked-on')">
							<translate>Blocked on</translate>
							<span v-if="sort === 'blocked-on'">
								<app-jolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('expires-on')">
							<translate>Expires</translate>
							<span v-if="sort === 'expires-on'">
								<app-jolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr v-for="block of blocks" :key="block.user.id" class="-row">
						<td>
							<router-link
								:to="{
									name: 'profile.overview',
									params: { username: block.user.username },
								}"
								class="-user-link"
							>
								<app-user-card-hover :user="block.user">
									<span class="-user-link">
										<app-user-avatar-img class="-avatar" :user="block.user" />
										<span class="-user-link-name">
											@{{ block.user.username }}
										</span>
									</span>
								</app-user-card-hover>
							</router-link>
						</td>

						<td>
							<router-link
								v-if="block.blocked_by_user"
								:to="{
									name: 'profile.overview',
									params: { username: block.blocked_by_user.username },
								}"
								class="-user-link"
							>
								<app-user-card-hover :user="block.blocked_by_user">
									<span class="-user-link">
										<app-user-avatar-img
											class="-avatar"
											:user="block.blocked_by_user"
										/>
										<span class="-user-link-name">
											@{{ block.blocked_by_user.username }}
										</span>
									</span>
								</app-user-card-hover>
							</router-link>
							<span v-else> - </span>
						</td>

						<td class="-info">
							<app-time-ago :date="block.blocked_on" />
						</td>

						<td class="-info">
							<translate v-if="!block.doesExpire"> Never </translate>
							<app-time-ago v-else :date="block.expires_on" is-future />
						</td>

						<td>
							<app-jolticon
								v-app-tooltip="$gettext(`Lift Block`)"
								class="-lift"
								icon="remove"
								@click="onClickLift(block)"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<app-pagination
			:total-items="totalCount"
			:current-page="page"
			:items-per-page="perPage"
			prevent-url-change
			@pagechange="onPageChanged"
		/>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.table
	margin-top: 20px

.-row > td
	border-bottom: $border-width-base solid var(--theme-bg-offset)

.-header
	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center
	max-width: 184px

	&-name
		text-overflow()

.-info
	min-width: 100px

.-avatar
	flex: none
	display: inline-block
	width: $line-height-computed
	margin-right: 6px

.-lift
	cursor: pointer
</style>
