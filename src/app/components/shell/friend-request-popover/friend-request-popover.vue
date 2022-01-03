<script lang="ts" src="./friend-request-popover"></script>

<template>
	<app-popper
		v-if="!Connection.isClientOffline"
		popover-class="fill-dark"
		fixed
		hide-on-state-change
		force-max-width
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			v-app-tooltip.bottom="$gettext(`Friend Requests`)"
			v-app-track-event="`top-nav:friend-requests:toggle`"
			class="navbar-item"
			:class="{ active: isShowing }"
		>
			<div v-if="hasNewFriendRequests" class="-new-tag anim-fade-enter anim-fade-leave" />
			<app-jolticon icon="friend-requests" />
		</a>

		<template v-if="isShowing" #header>
			<div class="-header fill-darker">
				<nav class="-nav platform-list inline nav-justified">
					<ul>
						<li>
							<a
								:class="{ active: activeTab === 'requests' }"
								@click="setActiveTab('requests')"
							>
								<translate>Friend Requests</translate>
								<span class="badge">{{ requestCount }}</span>
							</a>
						</li>
						<li v-if="pendingCount">
							<a
								:class="{ active: activeTab === 'pending' }"
								@click="setActiveTab('pending')"
							>
								<translate>Sent Requests</translate>
								<span class="badge">{{ pendingCount }}</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</template>

		<template v-if="isShowing" #popover>
			<div class="shell-card-popover">
				<div v-if="requests.length">
					<app-shell-friend-request-popover-item
						v-for="request of requests"
						:key="request.id"
						:request="request"
						@accept="acceptRequest(request)"
						@reject="rejectRequest(request)"
						@cancel="cancelRequest(request)"
					/>
				</div>
				<template v-if="isLoading">
					<br />
					<app-loading centered />
				</template>
				<div v-else-if="!requests.length" class="alert">
					<translate>No friend requests right now.</translate>
				</div>
				<div v-else-if="!isAtEnd" class="page-cut -load-more">
					<app-button v-app-track-event="`friend-requests:more`" trans @click="loadMore">
						<translate>Load More</translate>
					</app-button>
				</div>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
.-nav
	margin-bottom: 0
	padding-top: ($line-height-computed / 2)

.-load-more
	margin-top: 4px
	margin-bottom: 4px

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
