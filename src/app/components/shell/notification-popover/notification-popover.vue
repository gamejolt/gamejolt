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
			<app-jolticon icon="notifications" />
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
				<template v-else-if="!feed.hasItems">
					<div class="alert">
						<translate>You don't have any notifications yet.</translate>
					</div>
				</template>
				<template v-else>
					<app-activity-feed :feed="feed" />
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
</style>
