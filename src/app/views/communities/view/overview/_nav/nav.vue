<template>
	<nav>
		<app-scroll-scroller :horizontal="Screen.isMobile" thin>
			<div class="-inner">
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
					:background-item="community.all_background"
					sort="hot"
					:is-active="activeChannelTitle === 'all'"
					:is-unread="isChannelUnread('all')"
				/>

				<h5 v-if="Screen.isDesktop" class="-channels-header">
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
						:is-active="activeChannelTitle === channel.title"
						:is-unread="isChannelUnread(channel.title)"
						:is-locked="isChannelLocked(channel)"
					/>
				</template>
			</div>
		</app-scroll-scroller>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
