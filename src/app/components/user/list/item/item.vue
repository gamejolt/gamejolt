<template>
	<router-link
		class="user-list-item"
		:to="{
			name: 'profile.overview',
			params: {
				username: user.username,
			},
		}"
	>
		<div class="-avatar">
			<app-user-avatar-img :user="user" />
		</div>

		<div class="-label">
			<div class="-name">
				{{ user.display_name }}
				<app-jolticon v-if="user.is_verified" icon="verified" />
			</div>
			<div class="-username">@{{ user.username }}</div>
		</div>

		<div class="-button" v-if="user.id !== app.user.id">
			<!-- Gotta prevent default so that the router-link doesn't go to the user page. -->
			<app-user-follow-widget
				@click.native.capture="$event.preventDefault()"
				:user="user"
				hide-count
				event-label="user-list"
			/>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
