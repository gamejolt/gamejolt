<template>
	<!--
	Can currently only have one window open at a time.
-->
	<app-chat-window
		v-if="chat.room && isRightPaneVisible"
		:room="chat.room"
		:users="chat.usersOnline[chat.room.id]"
		:messages="chat.messages[chat.room.id]"
	/>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

/**
 * This gives the chat windows something to anchor to in the hot-bottom.
 */
.chat-windows
	position: relative
	height: 1px
	margin-bottom: 10px
	margin-right: $shell-pane-width
	display: flex
	justify-content: center
	align-items: flex-end
</style>

<script lang="ts" src="./windows"></script>
