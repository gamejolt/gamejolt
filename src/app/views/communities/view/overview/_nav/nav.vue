<template>
	<nav>
		<app-community-channel-card
			title="featured"
			:background-item="community.featured_background"
			:is-active="activeChannelTitle === 'featured'"
			:is-unread="isChannelUnread('featured')"
		/>
		<app-community-channel-card
			:key="community.id"
			title="all"
			:is-active="activeChannelTitle === 'all'"
			:is-unread="isChannelUnread('all')"
		/>

		<template v-if="community.channels">
			<app-community-channel-card
				v-for="channel of community.channels"
				:key="channel.id"
				:title="channel.title"
				:background-item="channel.background"
				:is-active="activeChannelTitle === channel.title"
				:is-unread="isChannelUnread(channel.title)"
			/>
		</template>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
