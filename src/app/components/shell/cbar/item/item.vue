<template>
	<router-link
		class="-item link-unstyled"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		v-app-tooltip.right="tooltip"
	>
		<app-community-thumbnail-img class="-thumb" :community="community" />
		<div
			class="-blip"
			:class="{
				'-blip-unread': isUnread,
				'-blip-active': isActive,
			}"
			:style="{
				'background-color': highlight,
			}"
		/>

		<div v-if="featureCount > 0" class="-feature-counter">
			{{ featureCountText }}
		</div>

		<app-popper
			class="-popper"
			trigger="right-click"
			placement="right"
			hide-on-state-change
			@show="popperVisible = true"
			@hide="popperVisible = false"
		>
			<div slot="popover" class="list-group list-group-dark">
				<app-community-perms :community="community" tag="span">
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
		</app-popper>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
