<template>
	<router-link
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		v-app-tooltip.right="community.name"
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
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
