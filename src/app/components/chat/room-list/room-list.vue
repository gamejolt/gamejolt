<template>
	<div class="chat-room-list">
		<ul v-show="rooms.length" class="shell-nav">
			<app-chat-room-list-item v-for="room of rooms" :key="room.id" :room="room" />
		</ul>
	</div>
</template>

<script lang="ts" src="./room-list"></script>
