<script lang="ts" src="./notification-popover"></script>

<template>
	<app-popper
		v-if="!Connection.isClientOffline"
		popover-class="fill-dark"
		fixed
		hide-on-state-change
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			v-app-tooltip.bottom="$gettext(`Notifications`)"
			v-app-track-event="`top-nav:notifications:toggle`"
			class="navbar-item"
			:class="{ active: isNavbarItemActive }"
			@click.capture="onNavbarItemClick"
		>
			<span
				v-if="count"
				class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
			>
				{{ count }}
			</span>
			<div v-if="hasNewUnlockedStickers" class="-new-tag anim-fade-enter anim-fade-leave" />
			<app-jolticon icon="bell-filled" />
			<div ref="newStickerAnimContainer" class="-new-sticker-anim-container" />
		</a>

		<template v-if="feed && isShowing">
			<div class="-header fill-darker small" slot="header">
				<a class="link-muted" @click="markNotificationsAsRead()">
					<translate>Mark All as Read</translate>
				</a>
			</div>
			<div class="shell-card-popover" slot="popover">
				<template v-if="isLoading">
					<br />
					<app-loading centered />
				</template>
				<template v-else>
					<app-shell-notification-popover-sticker-nav-item
						v-if="totalStickersCount > 0"
						:sticker-count="totalStickersCount"
						:has-new="hasNewUnlockedStickers"
					/>
					<template v-if="!feed.hasItems">
						<div class="alert">
							<translate>You don't have any notifications yet.</translate>
						</div>
					</template>
					<template v-else>
						<app-activity-feed :feed="feed" />
					</template>
				</template>
			</div>
			<div class="fill-darker" slot="footer">
				<app-button :to="{ name: 'notifications' }" block trans>
					<translate>View All</translate>
				</app-button>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

>>> .timeline-list-item-split
	full-bleed()

// The full-bleed would add a scrollbar if we didn't cut it off like this.
.shell-card-popover
	overflow: hidden

.-header
	padding: $popover-spacing
	text-align: right

.-new-sticker-anim-container
	position: absolute
	left: 14px
	top: 16px
	user-select: none
	pointer-events: none
	z-index: 3

.-new-tag
	border-radius: 50%
	width: 12px
	height: 12px
	display: block
	change-bg('highlight')
	position: absolute
	bottom: 10px
	right: 4px
	display: block
	border-color: var(--theme-darkest)
	border-width: 2px
	border-style: solid
</style>
