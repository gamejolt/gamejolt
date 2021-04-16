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
					<span v-if="isOwner" v-app-tooltip="$gettext(`Room Owner`)">
						<app-jolticon icon="crown" />
					</span>
					{{ user.display_name }}
					<span class="tiny">@{{ user.username }}</span>
				</div>
			</a>

			<template #popover>
				<div class="fill-darker -popover-info-container">
					<div class="-popover-avatar-container">
						<div class="-popover-avatar-img">
							<app-user-avatar class="-popover-avatar" :user="user" />
							<div class="-popover-avatar-circle" />
						</div>
					</div>

					<div class="-popover-names">
						<div class="-popover-displayname">
							<b>{{ user.display_name }}</b>
						</div>
						<div class="-popover-username text-muted">@{{ user.username }}</div>
					</div>

					<div v-if="isOnline !== null" class="-popover-status">
						<app-chat-user-online-status
							class="-popover-status-bubble"
							:is-online="isOnline"
							:size="16"
							:absolute="false"
						/>
						<span>{{ isOnline ? $gettext(`Online`) : $gettext(`Offline`) }}</span>
					</div>

					<div v-if="isOwner" class="-popover-status">
						<app-jolticon icon="crown" />
						<translate>Room Owner</translate>
					</div>
				</div>
				<div class="list-group list-group-dark">
					<router-link
						:to="{ name: 'profile.overview', params: { username: user.username } }"
						class="list-group-item has-icon"
					>
						<translate>View profile</translate>
					</router-link>
					<a
						v-if="canMessage"
						class="list-group-item has-icon"
						@click="onClickSendMessage"
					>
						<app-jolticon icon="message" />
						<translate>Send message</translate>
					</a>
					<template v-if="canModerate">
						<hr />
						<a class="list-group-item has-icon" @click="onClickKick">
							<app-jolticon icon="remove" notice />
							<translate>Kick from room</translate>
						</a>
					</template>
				</div>
			</template>
		</app-popper>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-popover
	&-info-container
		padding: 8px
		border-bottom-width: 2px
		border-bottom-style: solid
		border-bottom-color: var(--theme-darkest)

	&-names
		margin-top: 4px
		text-align: center

	&-username
		font-size: $font-size-small

	&-avatar
		width: 72px
		height: 72px
		z-index: 2
		transition: filter 0.1s ease

		&:hover
			filter: brightness(1.3) contrast(0.9)

		&-circle
			width: 80px
			height: 80px
			top: -4px
			left: -4px
			position: absolute
			z-index: 1
			border-radius: 50%
			background-color: var(--theme-darkest)

		&-img
			position: relative

		&-container
			display: flex
			justify-content: center
			margin-bottom: 10px

	&-status
		display: flex
		font-size: $font-size-small
		justify-content: center
		margin-top: 8px
		user-select: none

		&-bubble
			margin-right: 4px

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
</style>
