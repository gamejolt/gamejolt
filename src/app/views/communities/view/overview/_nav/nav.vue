<template>
	<nav :class="{ '-mobile-nav': Screen.isMobile }">
		<app-community-channel-card
			title="featured"
			:background-item="community.featured_background"
			:is-active="activeChannelTitle === 'featured'"
			:is-unread="isChannelUnread('featured')"
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
