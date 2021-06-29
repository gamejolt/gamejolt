<script lang="ts" src="./fireside"></script>

<template>
	<section class="section -section">
		<div
			v-if="shouldShowBackgroundImage"
			class="-fireside-background"
			:style="{
				'background-image': `url('` + backgroundImageUrl + ` ')`,
			}"
		/>
		<app-page-container xl class="-content">
			<template #default>
				<template v-if="fireside">
					<h2 class="sans-margin-top">
						<small class="-subtitle">
							<router-link
								:to="{
									name: 'profile.overview',
									params: { username: fireside.user.username },
								}"
							>
								@{{ fireside.user.username }}
							</router-link>
							<app-user-avatar-img class="-avatar" :user="fireside.user" />
							<span>'s Fireside</span>
						</small>
						<br />
						{{ fireside.title }}
					</h2>
				</template>

				<template v-if="status === 'loading' || status === 'initial'">
					<div key="loading" class="-fireside-message">
						<app-illustration src="~img/ill/end-of-feed.svg">
							<app-loading
								centered
								:label="$gettext(`Traveling to the Fireside...`)"
							/>
						</app-illustration>
					</div>
				</template>

				<template v-else-if="status === 'unauthorized'">
					<div key="unauthorized" class="-fireside-message">
						<h2 class="section-header text-center">
							<translate>Join Game Jolt</translate>
						</h2>

						<div class="text-center">
							<p class="lead">
								<translate>Do you love games as much as we do?</translate>
							</p>
						</div>

						<hr class="underbar underbar-center" />
						<br />

						<app-auth-join />
					</div>
				</template>

				<template v-else-if="status === 'expired'">
					<div key="expired" class="-fireside-message">
						<app-illustration src="~img/ill/no-comments-small.svg">
							<p>
								<translate>This Fireside's fire has burned out.</translate>
							</p>
							<p>
								<router-link :to="{ name: 'home' }">
									<small><translate>Everybody go home</translate></small>
								</router-link>
							</p>
						</app-illustration>
					</div>
				</template>

				<template v-else-if="status === 'setup-failed'">
					<div key="setup-failed" class="-fireside-message">
						<app-illustration src="~img/ill/maintenance.svg">
							<p>
								<translate>Could not reach this Fireside.</translate>
								<br />
								<translate>Maybe try finding it again?</translate>
							</p>
							&nbsp;
							<app-button block @click="onClickRetry">
								<translate>Retry</translate>
							</app-button>
							&nbsp;
						</app-illustration>
					</div>
				</template>

				<template v-else-if="status === 'disconnected'">
					<div key="disconnected" class="-fireside-message">
						<app-illustration src="~img/ill/no-comments-small.svg">
							<p>
								<translate>
									You have been disconnected from Fireside services.
								</translate>
								<br /><br />
								<small>
									<translate>
										We are actively trying to reconnect you, but you can also
										try refreshing the page.
									</translate>
								</small>
							</p>
						</app-illustration>
					</div>
				</template>

				<template v-else-if="status === 'blocked'">
					<div key="blocked" class="-fireside-message">
						<div class="text-center">
							<app-jolticon icon="friend-remove-2" big notice />
						</div>
						<div class="text-center">
							<h3>
								<translate>You are blocked from joining this Fireside</translate>
							</h3>
							<p>
								<router-link :to="{ name: 'home' }">
									<small><translate>Return home</translate></small>
								</router-link>
							</p>
						</div>
					</div>
				</template>

				<template v-else-if="status === 'joined'">
					<template v-if="shouldShowChat">
						<div class="-chat-window -content-obj">
							<app-chat-window-output
								v-if="chatRoom"
								class="-chat-window-output fill-backdrop"
								:room="chatRoom"
								:messages="chatMessages"
								:queued-messages="chatQueuedMessages"
							/>

							<app-chat-window-send class="-chat-window-input" :room="chatRoom" />
						</div>
					</template>
				</template>
			</template>

			<template #right>
				<template v-if="shouldShowChat">
					<div class="-chat-members -content-obj -sidebar-obj">
						<app-fireside-chat-members :chat-users="chatUsers" :chat-room="chatRoom" />
					</div>
				</template>
			</template>

			<template #left>
				<template v-if="status === 'joined'">
					<div class="-content-obj -sidebar-obj">
						<app-fireside-stats :fireside="fireside" :status="status" />
					</div>
				</template>
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-section
	position: relative

.-subtitle
	*
		vertical-align: middle

.-avatar
	width: 16px
	display: inline-block

.-fireside-background
	position: absolute
	left: 0
	right: 0
	top: 50px
	height: 100%
	max-height: 500px
	z-index: 0
	mask: radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 20%, transparent 60%)
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	opacity: 0
	animation-name: fade-in
	animation-duration: 4s
	animation-iteration-count: 1
	animation-fill-mode: forwards

@keyframes fade-in
	0%
		opacity: 0
		filter: grayscale(0.5)

	100%
		opacity: 1
		filter: none

.-fireside-message
	margin-top: 80px
	rounded-corners-lg()
	elevate-2()
	padding: 16px
	change-bg('bg-offset')
	animation-name: fade-in
	animation-duration: 0.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards

.-content
	position: relative
	z-index: 1
	min-height: 'calc(80vh - %s)' % $shell-top-nav-height

.-content-obj
	height: 'calc(80vh - %s)' % $shell-top-nav-height
	max-height: 1000px
	animation-name: fade-in
	animation-duration: 0.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards

.-sidebar-obj
	margin-top: 78px

.-chat-window
	display: flex
	flex-direction: column
	rounded-corners-lg()
	elevate-2()

	&-output
		flex-grow: 1
		rounded-corners-lg()
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0

	&-input
		rounded-corners-lg()
		border-top-left-radius: 0
		border-top-right-radius: 0

.-chat-members
	display: flex
	flex-direction: column
	animation-name: fade-in
	animation-duration: 0.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
</style>
