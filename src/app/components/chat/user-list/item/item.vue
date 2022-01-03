<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		tag="li"
		class="-container"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<app-popper
			popover-class="fill-darkest"
			trigger="right-click"
			placement="bottom"
			block
			fixed
			hide-on-state-change
		>
			<template #default>
				<span>
					<a
						v-if="isInview"
						class="-item"
						:class="{
							active: isActive,
						}"
						:title="hoverTitle"
						v-on="componentEvents"
					>
						<span v-if="notificationsCount" class="tag tag-highlight notifications-tag">
							{{ notificationsCountLocalized }}
						</span>

						<div class="shell-nav-icon">
							<div class="-avatar">
								<template v-if="user">
									<img :src="user.img_avatar" />
									<app-chat-user-online-status
										v-if="isOnline !== null"
										class="-avatar-status"
										:is-online="isOnline"
										:size="12"
									/>
								</template>
								<div v-else class="-group-icon">
									<app-jolticon icon="users" />
								</div>
							</div>
						</div>

						<div class="shell-nav-label">
							{{ title }}
							<span v-if="meta" class="tiny text-muted">{{ meta }}</span>
						</div>
					</a>
				</span>
			</template>

			<template #popover>
				<div class="fill-darker">
					<div class="list-group list-group-dark">
						<app-chat-notification-settings :room-id="roomId" :is-pm-room="!!user" />

						<template v-if="!user">
							<hr />
							<a class="list-group-item has-icon" @click="leaveRoom">
								<app-jolticon icon="logout" notice />
								<translate>Leave Room</translate>
							</a>
						</template>
					</div>
				</div>
			</template>
		</app-popper>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
.-container
	height: 50px
	overflow: hidden

.-avatar
	position: relative

	img
		img-circle()
		display: inline-block
		width: 24px
		vertical-align: middle

	.-group-icon
		img-circle()
		display: inline-flex
		align-items: center
		justify-content: center
		vertical-align: middle
		width: 32px
		height: 32px
		background-color: var(--theme-backlight)

		.jolticon
			color: var(--theme-backlight-fg) !important

	&-status
		right: 12px
		bottom: 10px

.-action
	display: inline-block
	float: right
	padding-left: 8px
	color: var(--theme-fg-muted) !important

	&:hover
		color: var(--theme-fg) !important
</style>
