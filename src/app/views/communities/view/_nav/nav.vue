<template>
	<div class="-inner">
		<app-community-channel-card
			:community="community"
			:path="frontpageChannel.title"
			label="Frontpage"
			:background-item="frontpageChannel.background"
			:is-active="activeChannel === frontpageChannel"
			:is-unread="isChannelUnread(frontpageChannel)"
		/>

		<app-community-channel-card
			:community="community"
			:path="allChannel.title"
			sort="hot"
			label="All Posts"
			:background-item="allChannel.background"
			:is-active="activeChannel === allChannel"
			:is-unread="isChannelUnread(allChannel)"
		/>

		<h5 v-if="Screen.isDesktop" class="-heading">
			<translate>Channels</translate>
		</h5>

		<template v-if="community.channels">
			<app-community-channel-card
				v-for="channel of community.channels"
				:key="channel.id"
				:community="community"
				:path="channel.title"
				:label="channel.title"
				:background-item="channel.background"
				:is-active="activeChannel === channel"
				:is-unread="isChannelUnread(channel)"
				:is-locked="isChannelLocked(channel)"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-heading
	margin-top: 24px
</style>

<script lang="ts" src="./nav"></script>
