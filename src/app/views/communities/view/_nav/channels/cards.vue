<template>
	<div>
		<app-community-channel-card
			:community="community"
			:path="frontpageChannel.title"
			label="Frontpage"
			:background-item="frontpageChannel.background"
			:is-active="activeChannel === frontpageChannel"
			:is-unread="isChannelUnread(frontpageChannel)"
			@click-channel="onChannelClick"
		/>

		<app-community-channel-card
			:community="community"
			:path="allChannel.title"
			sort="hot"
			label="All Posts"
			:background-item="allChannel.background"
			:is-active="activeChannel === allChannel"
			:is-unread="isChannelUnread(allChannel)"
			@click-channel="onChannelClick"
		/>

		<h5 class="-heading">
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
				@click-channel="onChannelClick"
			/>
		</template>
	</div>
</template>

<script lang="ts" src="./cards"></script>

<style lang="stylus" scoped>
@import '~styles/variables'

.-heading
	margin-top: 24px
</style>
