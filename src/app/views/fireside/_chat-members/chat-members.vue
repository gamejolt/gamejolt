<script lang="ts" src="./chat-members"></script>

<template>
	<div class="-chat-members">
		<h3 class="sans-margin-top">
			<translate>Members</translate>
		</h3>
		<app-scroll-scroller class="-chat-members-scroller">
			<app-chat-member-list
				v-if="chatUsers"
				:users="chatUsers.collection"
				:room="chatRoom"
				hide-filter
			/>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
.-chat-members
	overflow: hidden

.-chat-members-scroller
	flex-grow: 1
	// Scrollbar breathing room
	padding-right: 4px
</style>
