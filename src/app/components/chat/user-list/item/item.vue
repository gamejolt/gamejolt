<template>
	<app-scroll-inview
		tag="li"
		class="chat-user"
		:margin="`${Screen.height / 2}px`"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<template v-if="isInview">
			<router-link
				:to="user.url"
				:class="{
					active: showPm && chat.room && chat.room.id === user.room_id,
				}"
				:title="`${user.display_name} (@${user.username})`"
				@click.native.capture="onUserClick"
			>
				<span
					class="tag tag-highlight notifications-tag"
					v-if="chat.notifications[user.room_id] || 0"
				>
					{{ chat.notifications[user.room_id] || 0 | number }}
				</span>

				<div class="shell-nav-icon">
					<div class="user-avatar">
						<img :src="user.img_avatar" />

						<span
							class="chat-user-status"
							v-if="typeof user.isOnline !== 'undefined'"
							:class="{
								offline: !user.isOnline,
								'online active': user.isOnline,
							}"
						></span>
					</div>
				</div>

				<div class="shell-nav-label">
					{{ user.display_name }}
					<span class="tiny">@{{ user.username }}</span>

					<!--<div class="chat-user-list-meta">
					<template v-if="typeof user.currently_playing !== 'undefined' && user.currently_playing">
						Playing <em>{{ user.currently_playing.game }}</em>
					</template>
				</div>-->
				</div>
			</router-link>
		</template>
	</app-scroll-inview>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
