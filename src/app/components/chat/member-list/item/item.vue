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
			v-if="isInview"
			popover-class="fill-darkest"
			block
			:placement="Screen.isMobile ? 'bottom' : 'left'"
		>
			<a>
				<div class="shell-nav-icon">
					<div class="-avatar">
						<img :src="user.img_avatar" />
						<app-chat-user-online-status
							v-if="isOnline !== null"
							class="-avatar-status"
							:is-online="isOnline"
							:size="12"
						/>
					</div>
				</div>

				<div class="shell-nav-label">
					<span class="-row-icon">
						<span v-if="isOwner" v-app-tooltip="$gettext(`Room Owner`)">
							<app-jolticon icon="crown" />
						</span>
						<span v-else-if="isStaff" v-app-tooltip="$gettext(`Game Jolt Staff`)">
							<app-jolticon icon="gamejolt" />
						</span>
						<span v-else-if="isModerator" v-app-tooltip="$gettext(`Moderator`)">
							<app-jolticon icon="star" />
						</span>
					</span>
					<span>{{ user.display_name }}</span>
					<span class="tiny text-muted">@{{ user.username }}</span>
				</div>
			</a>

			<template #popover>
				<app-chat-user-popover :user="user" :room="room" />
			</template>
		</app-popper>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-container
	height: 50px
	overflow: hidden
	rounded-corners()

.-row-icon
	vertical-align: middle

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
</style>
