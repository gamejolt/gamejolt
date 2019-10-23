<template>
	<div>
		<h2 class="section-header">
			<translate>Blocks</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					Block users from contributing to this community. They will not be able to join, post or
					comment.
				</translate>
			</p>
		</div>

		<app-card-list :is-adding="isBlocking">
			<app-card-list-add :label="$gettext('Block User')" @toggle="isBlocking = !isBlocking">
				<form-community-block :community="community" @submit="onBlockSubmit" />
			</app-card-list-add>
		</app-card-list>

		<table v-if="hasBlocks" class="table">
			<thead>
				<tr>
					<th class="-header" @click="changeSort('name')">
						<translate>Blocked user</translate>
						<span v-if="sort === 'name'">
							<app-jolticon :icon="sortIcon" v-app-tooltip="sortDirectionLabel" />
						</span>
					</th>
					<th class="-header" @click="changeSort('blocker')">
						<translate>Issued by</translate>
						<span v-if="sort === 'blocker'">
							<app-jolticon :icon="sortIcon" v-app-tooltip="sortDirectionLabel" />
						</span>
					</th>
					<th class="-header" @click="changeSort('blocked-on')">
						<translate>Came into effect</translate>
						<span v-if="sort === 'blocked-on'">
							<app-jolticon :icon="sortIcon" v-app-tooltip="sortDirectionLabel" />
						</span>
					</th>
					<th class="-header" @click="changeSort('expires-on')">
						<translate>Expires</translate>
						<span v-if="sort === 'expires-on'">
							<app-jolticon :icon="sortIcon" v-app-tooltip="sortDirectionLabel" />
						</span>
					</th>
					<th></th>
				</tr>
			</thead>

			<tr v-for="block of blocks" :key="block.user.id" class="-row">
				<td>
					<router-link
						:to="{ name: 'profile.overview', params: { username: block.user.username } }"
						class="-user-link"
					>
						<app-user-card-hover :user="block.user">
							<span class="-user-link">
								@{{ block.user.username }}
								<app-user-avatar-img class="-avatar" :user="block.user" />
							</span>
						</app-user-card-hover>
					</router-link>
				</td>

				<td>
					<router-link
						v-if="block.blocked_by_user"
						:to="{ name: 'profile.overview', params: { username: block.blocked_by_user.username } }"
						class="-user-link"
					>
						<app-user-card-hover :user="block.blocked_by_user">
							<span class="-user-link">
								@{{ block.blocked_by_user.username }}
								<app-user-avatar-img class="-avatar" :user="block.blocked_by_user" />
							</span>
						</app-user-card-hover>
					</router-link>
					<span v-else>
						-
					</span>
				</td>

				<td>
					<app-time-ago :date="block.blocked_on" />
				</td>

				<td>
					<translate v-if="!block.doesExpire">
						Never
					</translate>
					<app-time-ago v-else :date="block.expires_on" is-future />
				</td>

				<td>
					<app-jolticon
						class="-lift"
						@click.native="onClickLift(block)"
						icon="remove"
						v-app-tooltip="$gettext(`Lift Block`)"
					/>
				</td>
			</tr>
		</table>

		<app-pagination
			:total-items="totalCount"
			:current-page="page"
			:items-per-page="perPage"
			prevent-url-change
			@pagechange="onPageChanged"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.table
	margin-top: 20px

.-row > td
	padding-top: 5px
	padding-bottom: 5px
	border-bottom: 1px solid var(--theme-bg-offset)

.-header
	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center

.-avatar
	display: inline-block
	width: $line-height-computed

.-lift
	cursor: pointer

</style>

<script lang="ts" src="./blocks"></script>
