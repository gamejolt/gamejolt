<template>
	<nav>
		<router-link
			:to="{ name: 'communities.view.overview' }"
			class="-nav-featured"
			active-class="active"
			exact
		>
			<translate>Featured</translate>
		</router-link>

		<div v-if="community.channels" :class="{ '-mobile-nav': Screen.isMobile }">
			<app-community-channel-card
				v-for="channel of community.channels"
				:key="channel.id"
				:channel="channel"
				:is-active="activeChannelTitle === channel.title"
				:is-unread="isChannelUnread(channel.title)"
			/>
		</div>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
