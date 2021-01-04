<script lang="ts" src="./community"></script>

<template>
	<div>
		<app-popper
			popover-class="fill-darkest"
			trigger="right-click"
			placement="right"
			fixed
			block
			hide-on-state-change
			@show="popperVisible = true"
			@hide="popperVisible = false"
		>
			<template #default>
				<div @click.capture="onCommunityClick">
					<app-shell-cbar-item
						class="-community"
						:is-active="isActive"
						:is-unread="isUnread"
						:highlight="highlight"
					>
						<router-link
							v-app-tooltip.right="tooltip"
							class="-link link-unstyled"
							:to="{
								name: 'communities.view.overview',
								params: { path: community.path },
							}"
						>
							<app-media-item-backdrop
								class="-backdrop"
								:media-item="community.thumbnail"
								radius="full"
							>
								<app-community-thumbnail-img
									class="-thumb"
									:community="community"
								/>
							</app-media-item-backdrop>
						</router-link>
					</app-shell-cbar-item>
				</div>
			</template>

			<template #popover>
				<div class="list-group list-group-dark">
					<app-community-perms :community="community">
						<router-link
							class="list-group-item has-icon"
							:to="community.routeEditLocation"
						>
							<app-jolticon icon="edit" />
							<translate>Edit Community</translate>
						</router-link>
					</app-community-perms>
					<a
						v-if="shouldShowLeave"
						class="list-group-item has-icon"
						@click="onLeaveCommunityClick"
					>
						<app-jolticon icon="remove" notice />
						<translate>Leave Community</translate>
					</a>
					<a
						v-else-if="shouldShowJoin"
						class="list-group-item has-icon"
						@click="onJoinCommunityClick"
					>
						<app-jolticon icon="add" notice />
						<translate>Join Community</translate>
					</a>
					<a
						v-if="shouldShowModerate"
						class="list-group-item has-icon"
						@click="gotoModerate"
					>
						<app-jolticon icon="cog" />
						<translate>Moderate Community</translate>
					</a>
				</div>
			</template>
		</app-popper>

		<hr v-if="!community.is_member" class="-hr" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../common'

.-community
	pressy()

.-backdrop
	change-bg('dark')

.-thumb
	width: 100%
	height: 100%

	>>> img
		width: calc(100% - 2px)
		height: calc(100% - 2px)

.-notice
	theme-prop('color', 'notice')
</style>
