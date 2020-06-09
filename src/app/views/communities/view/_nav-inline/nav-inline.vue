<template>
	<nav class="-nav">
		<app-scroll-scroller class="-scroller" horizontal thin>
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
		</app-scroll-scroller>
	</nav>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../../../../components/community/channel/card/variables'

// .-nav
// 	margin-bottom: $line-height-computed

.-scroller
	padding-top: $line-height-computed
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

.-inner
	display: flex

	.community-channel-card
		margin-right: 8px
		width: 200px
</style>

<script lang="ts" src="./nav-inline"></script>
