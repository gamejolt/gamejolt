<template>
	<router-link
		class="user-list-item"
		:to="{
			name: 'profile.overview',
			params: {
				username: user.username,
			},
		}"
		v-app-track-event="`user-list:click:${eventLabel || 'any'}`"
	>
		<component :is="userHoverCard ? 'app-user-card-hover' : 'div'" :user="user" class="-avatar">
			<app-user-avatar-img :user="user" />
		</component>

		<div class="-label">
			<div class="-name">
				{{ user.display_name }}
				<app-user-verified-tick :user="user" />
			</div>
			<div class="-username">@{{ user.username }}</div>
		</div>

		<div class="-button" v-if="app.user && user.id !== app.user.id">
			<!--
				Gotta prevent default so that the router-link doesn't go to the
				user page. The stop is so that we don't double track events.
			-->
			<app-user-follow-widget
				@click.native.capture.prevent
				@click.native.stop
				:user="user"
				@follow="emitFollow()"
				@unfollow="emitUnfollow()"
				hide-count
				:event-label="eventLabel || `user-list`"
			/>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
