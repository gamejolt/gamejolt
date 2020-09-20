<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		tag="li"
		class="-container"
		:margin="`${Screen.height / 2}px`"
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
				<template v-if="user">
					<div class="-avatar">
						<img :src="user.img_avatar" />
						<app-chat-user-online-status
							v-if="isOnline !== null"
							class="-avatar-status"
							:is-online="isOnline"
							:size="12"
						/>
					</div>
				</template>
			</div>

			<div class="shell-nav-label">
				<span v-if="isOwner" v-app-tooltip="`Room Owner`">
					👑
				</span>
				{{ title }}
				<span v-if="meta" class="tiny">{{ meta }}</span>
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
