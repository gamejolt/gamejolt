<script lang="ts" src="./windows"></script>

<template>
	<!--
		Can currently only have one window open at a time.
	-->
	<app-chat-window
		v-if="chat.room && visibleLeftPane === 'chat'"
		:room="chat.room"
		:messages="chat.messages[chat.room.id]"
		:queued-messages="getRoomQueuedMessages(chat.room.id)"
	/>
</template>
