<template>
	<nav>
		<app-community-channel-card
			:community="community"
			path="featured"
			label="Featured"
			:background-item="community.featured_background"
			:is-active="activeChannelTitle === 'featured'"
			:is-unread="isChannelUnread('featured')"
		/>
		<app-community-channel-card
			:community="community"
			path="all"
			label="All Posts"
			sort="hot"
			:is-active="activeChannelTitle === 'all'"
			:is-unread="isChannelUnread('all')"
		/>

		<template v-if="community.channels">
			<app-community-channel-card
				v-for="channel of community.channels"
				:key="channel.id"
				:community="community"
				:path="channel.title"
				:label="channel.title"
				:background-item="channel.background"
				:is-active="activeChannelTitle === channel.title"
				:is-unread="isChannelUnread(channel.title)"
				:is-locked="!channel.permissions.canPerform('posts')"
			/>
		</template>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
