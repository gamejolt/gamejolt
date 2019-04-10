<template>
	<app-popper
		v-if="!Connection.isClientOffline"
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
							<a :class="{ active: activeTab === 'requests' }" @click="setActiveTab('requests')">
								<translate>Friend Requests</translate>
								<span class="badge">{{ friendRequestCount }}</span>
							</a>
						</li>
						<li v-if="outgoing.length">
							<a :class="{ active: activeTab === 'pending' }" @click="setActiveTab('pending')">
								<translate>Sent Requests</translate>
								<span class="badge">{{ outgoing.length }}</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
			<div class="shell-card-popover fill-dark" slot="popover">
				<template v-if="isLoading">
					<br />
					<app-loading centered />
				</template>
				<div v-else-if="requests.length">
					<app-shell-friend-request-popover-item
						v-for="request of requests"
						:key="request.id"
						:request="request"
						@accept="acceptRequest(request)"
						@reject="rejectRequest(request)"
						@cancel="cancelRequest(request)"
					/>
				</div>
				<div class="alert" v-else>
					<translate>No friend requests right now.</translate>
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
</style>

<script lang="ts" src="./friend-request-popover"></script>
