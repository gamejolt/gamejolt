<script lang="ts" src="./list"></script>

<template>
	<div class="user-list">
		<app-user-list-item
			v-for="user of users"
			:key="user.id"
			:user="user"
			:event-label="eventLabel"
			:user-hover-card="userHoverCard"
			@follow="emitFollow(user)"
			@unfollow="emitUnfollow(user)"
		/>
	</div>
</template>
