<template>
	<router-link
		class="-item -unread"
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
				'-blip-active': isActive,
			}"
			:style="{
				'background-color': isActive || isUnread ? highlight : undefined,
			}"
		/>
		<div
			class="-notification"
			v-if="isUnread"
			:style="{
				'background-color': highlight,
			}"
		/>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped />

<script lang="ts" src="./item" />
