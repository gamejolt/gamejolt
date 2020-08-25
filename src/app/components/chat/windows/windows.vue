<template>
	<!--
		Can currently only have one window open at a time.
	-->
	<app-chat-window
		v-if="chat.room && isRightPaneVisible"
		:room="chat.room"
		:users="chat.usersOnline[chat.room.id]"
		:messages="chat.messages[chat.room.id]"
		:queued-messages="getRoomQueuedMessages(chat.room.id)"
	/>
</template>

<script lang="ts" src="./windows"></script>
