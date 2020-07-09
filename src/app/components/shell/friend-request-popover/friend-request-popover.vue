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
			class="navbar-item"
			:class="{ active: isShowing }"
			v-app-tooltip.bottom="$gettext(`Friend Requests`)"
			v-app-track-event="`top-nav:friend-requests:toggle`"
		>
			<span
				class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
				v-if="friendRequestCount"
			>
				{{ friendRequestCount }}
			</span>
			<app-jolticon icon="friend-requests" />
		</a>

		<template v-if="isShowing">
			<div class="-header fill-darker" slot="header">
				<nav class="-nav platform-list inline nav-justified">
					<ul>
						<li>
							<a
								:class="{ active: activeTab === 'requests' }"
								@click="setActiveTab('requests')"
							>
								<translate>Friend Requests</translate>
								<span class="badge">{{ friendRequestCount }}</span>
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
			<div class="shell-card-popover" slot="popover">
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
				<div class="alert" v-else-if="!requests.length">
					<translate>No friend requests right now.</translate>
				</div>
				<div v-else-if="!isAtEnd" class="page-cut -load-more">
					<app-button trans @click="loadTab" v-app-track-event="`friend-requests:more`">
						<translate>Load More</translate>
					</app-button>
				</div>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-nav
	margin-bottom: 0
	padding-top: ($line-height-computed / 2)

.-load-more
	margin-top: 4px
	margin-bottom: 4px
</style>

<script lang="ts" src="./friend-request-popover"></script>
