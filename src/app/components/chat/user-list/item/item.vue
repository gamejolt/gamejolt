<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		tag="li"
		class="chat-user"
		:margin="`${Screen.height / 2}px`"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<router-link
			v-if="isInview"
			:to="user.url"
			:class="{
				active: showPm && chat.room && chat.room.id === user.room_id,
			}"
			:title="`${user.display_name} (@${user.username})`"
			@click.native.capture="onUserClick"
		>
			<span
				v-if="chat.notifications[user.room_id] || 0"
				class="tag tag-highlight notifications-tag"
			>
				{{ chatNotificationsCount }}
			</span>

			<div class="shell-nav-icon">
				<div class="user-avatar">
					<img :src="user.img_avatar" />

					<span
						v-if="typeof user.isOnline !== 'undefined'"
						class="chat-user-status"
						:class="{
							offline: !user.isOnline,
							'online active': user.isOnline,
						}"
					>
						<span v-if="!user.isOnline" class="chat-user-status-inner" />
					</span>
				</div>
			</div>

			<div class="shell-nav-label">
				{{ user.display_name }}
				<span class="tiny">@{{ user.username }}</span>
			</div>
		</router-link>
	</app-scroll-inview>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
