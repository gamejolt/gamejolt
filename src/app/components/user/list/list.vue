<template>
	<div class="user-list">
		<app-user-list-item
			v-for="user of users"
			:key="user.id"
			:user="user"
			:follow-event-label="followEventLabel"
		/>
	</div>
</template>

<script lang="ts" src="./list"></script>
