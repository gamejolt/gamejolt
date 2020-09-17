<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		tag="li"
		class="chat-room-container"
		:margin="`${Screen.height / 2}px`"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<a
			v-if="isInview"
			class="chat-room"
			:class="{
				active: chat.room && chat.room.id === room.id,
			}"
			:title="room.getGroupTitle(chat)"
			@click="onRoomClicked(room.id)"
		>
			<span class="chat-room-container-remove">
				<a v-app-tooltip="$gettext('Leave Room')" class="link-muted" @click="leaveRoom">
					<app-jolticon icon="remove" class="middle" />
				</a>
			</span>

			<span
				v-if="chat.notifications[room.id] || 0"
				class="tag tag-highlight notifications-tag"
			>
				{{ chatNotificationsCount }}
			</span>

			<div class="shell-nav-icon">
				<app-jolticon icon="users" />
			</div>

			<div class="shell-nav-label">{{ room.getGroupTitle(chat) }}</div>
		</a>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.chat-room
	padding-right: 0px

.chat-room-container
	height: 50px
	overflow: hidden

	&-remove
		visibility: hidden
		display: inline-block
		float: right
		padding-left: 8px

		../:hover &
			visibility: visible
</style>
