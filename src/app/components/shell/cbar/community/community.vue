<template>
	<app-popper
		class="-community"
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
			<app-shell-cbar-item :is-active="isActive" :is-unread="isUnread" :highlight="highlight">
				<router-link
					class="-link link-unstyled"
					:to="{
						name: 'communities.view.overview',
						params: { path: community.path },
					}"
					v-app-tooltip.right="tooltip"
				>
					<app-media-item-backdrop
						class="-backdrop"
						:media-item="community.thumbnail"
						radius="full"
					>
						<app-community-thumbnail-img class="-thumb" :community="community" />
					</app-media-item-backdrop>
				</router-link>
			</app-shell-cbar-item>
		</template>

		<template #popover>
			<div class="list-group list-group-dark">
				<app-community-perms :community="community">
					<router-link class="list-group-item has-icon" :to="community.routeEditLocation">
						<app-jolticon icon="edit" />
						<translate>Edit Community</translate>
					</router-link>
				</app-community-perms>
				<a class="list-group-item has-icon" v-if="shouldShowLeave" @click="onLeaveCommunityClick">
					<app-jolticon icon="remove" />
					<translate class="-notice">Leave Community</translate>
				</a>
				<a v-if="shouldShowModerate" class="list-group-item has-icon" @click="gotoModerate">
					<app-jolticon icon="cog" />
					<translate>Moderate Community</translate>
				</a>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" src="./community.styl" scoped></style>

<script lang="ts" src="./community"></script>
