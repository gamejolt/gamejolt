<template>
	<router-link
		class="-item"
		:class="{
			'-unread': isUnread,
		}"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
	>
		<div
			class="-bubble"
			:style="{
				'background-image': isUnread ? gradient : undefined,
			}"
		>
			<app-community-thumbnail-img class="-thumb" :community="community" />
		</div>

		<div class="-label">
			{{ community.name }}
		</div>
	</router-link>
</template>

<style src="./item.styl" scoped />

<script lang="ts" src="./item" />
