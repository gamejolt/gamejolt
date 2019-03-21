<template>
	<app-popper
		v-if="!Connection.isClientOffline"
		hide-on-state-change
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			class="navbar-item"
			:class="{ active: isNavbarItemActive }"
			@click.capture="onNavbarItemClick"
			v-app-tooltip.bottom="$gettext(`Notifications`)"
			v-app-track-event="`top-nav:notifications:toggle`"
		>
			<span class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave" v-if="count">
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
			<div class="shell-card-popover fill-dark" slot="popover">
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
					<app-activity-feed :feed="feed" :new-count="0" @load-new="loadedNew()" />
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
@require '~styles/variables'
@require '~styles-lib/mixins'

>>> .timeline-list-item-split
	full-bleed()

// The full-bleed would add a scrollbar if we didn't cut it off like this.
.shell-card-popover
	overflow: hidden

.-header
	padding: $popover-spacing
	text-align: right
</style>

<script lang="ts" src="./notification-popover" />
