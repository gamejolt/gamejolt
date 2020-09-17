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
			<div class="chat-room-container-remove">
				<span>
					<app-button v-app-tooltip="$gettext('Leave Room')" circle trans icon="remove" @click="leaveRoom" />
				</span>
			</div>

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

.chat-room-container
	&-remove
		visibility: hidden
		display: inline-block
		float: right

		../:hover &
			visibility: visible
</style>
