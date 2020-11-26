<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		tag="li"
		class="-container"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<component
			:is="component"
			v-if="isInview"
			v-bind="componentProps"
			class="-item"
			:class="{
				active: isActive,
			}"
			:title="hoverTitle"
			v-on="componentEvents"
		>
			<template v-if="!user">
				<span
					v-if="isHovered || Screen.isXs"
					v-app-tooltip="$gettext('Leave Room')"
					class="-action"
					@click.stop.prevent="leaveRoom"
				>
					<app-jolticon icon="remove" class="middle" />
				</span>
			</template>

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
				<span v-if="isOwner" v-app-tooltip="`Room Owner`">
					<app-jolticon icon="crown" />
				</span>
				{{ title }}
				<span v-if="meta" class="tiny">{{ meta }}</span>

				<span v-if="currentRoom && !isOwner">
					<app-popper>
						<template #default>
							<a v-app-tooltip="$gettext('Manage Member')" class="link-muted -user-options">
								<app-jolticon icon="cog" class="middle" />
							</a>
						</template>

						<template #popover>
							<div class="list-group">
								<a class="list-group-item has-icon" @click="kickUser">
									<app-jolticon icon="friend-remove-1" />
									<translate>Kick Member</translate>
								</a>
							</div>
						</template>
					</app-popper>
				</span>
			</div>
		</component>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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

.-user-options
	display: inline-block
	color: var(--theme-fg-muted) !important

	&:hover
		color: var(--theme-fg) !important
</style>
