<script lang="ts" src="./fireside"></script>

<template>
	<div class="-fireside">
		<div class="-header">
			<template v-if="fireside">
				<div class="-fireside-title">
					<h2 class="sans-margin-top" :class="{ h3: Screen.isXs }">
						<small class="-subtitle">
							<template v-if="fireside.community">
								<router-link :to="fireside.community.routeLocation">
									{{ fireside.community.name }}
								</router-link>
								<div class="-avatar -community-avatar">
									<app-community-thumbnail-img :community="fireside.community" />
								</div>
							</template>
							<template v-else>
								<router-link
									:to="{
										name: 'profile.overview',
										params: { username: fireside.user.username },
									}"
								>
									@{{ fireside.user.username }}
								</router-link>
								<app-user-avatar-img class="-avatar" :user="fireside.user" />
							</template>
							<span>'s Fireside</span>
						</small>
						<br />
						{{ fireside.title }}
					</h2>
					<div
						v-if="shouldShowChatMemberStats && chatUsers"
						class="-fireside-title-member-stats"
					>
						<ul class="stat-list">
							<a @click="onClickShowChatMembers">
								<li class="stat-big stat-big-smaller">
									<div class="stat-big-label">Members</div>
									<div class="stat-big-digit">{{ number(chatUsers.count) }}</div>
								</li>
							</a>
						</ul>
					</div>
					<div v-if="shouldShowTitleControls" class="-fireside-title-controls">
						<app-button
							v-if="shouldShowEditControlButton"
							v-app-tooltip="$gettext(`Edit Fireside`)"
							icon="edit"
							circle
							sparse
							@click="onClickEditFireside"
						/>
						<app-button
							v-if="!shouldShowChatMembers"
							v-app-tooltip="$gettext(`Chat Members`)"
							icon="users"
							circle
							sparse
							@click="onClickShowChatMembers"
						/>
						<div v-if="!shouldShowFiresideStats" class="-stats-btn">
							<app-button
								v-app-tooltip="$gettext(`Fireside info`)"
								icon="fireside"
								circle
								sparse
								:solid="hasExpiryWarning"
								:primary="hasExpiryWarning"
								@click="onClickShowFiresideStats"
							/>
							<app-jolticon
								v-if="hasExpiryWarning"
								icon="notice"
								notice
								class="-stats-btn-warn"
							/>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div class="-split" />
		<div class="-body" :class="{ '-body-column': isVertical, '-is-streaming': isStreaming }">
			<div v-if="shouldShowFiresideStats" class="-leading">
				<app-fireside-stats
					:fireside="fireside"
					:status="status"
					:is-streaming="isStreaming"
				/>
			</div>

			<div
				v-if="isStreaming && chatRoom"
				class="-video-wrapper"
				:class="{ '-vertical': isVertical }"
			>
				<div class="-video-padding">
					<div
						ref="videoWrapper"
						v-app-observe-dimensions="onDimensionsChange"
						class="-video-container"
					>
						<div
							class="-video-inner"
							:style="{
								width: videoWidth + 'px',
								height: videoHeight + 'px',
							}"
						>
							<template v-if="rtc && rtc.focusedUser">
								<app-fireside-video
									:key="'video-' + rtc.focusedUser.userId"
									:rtc-user="rtc.focusedUser"
									:show-hosts="!shouldShowHosts"
									:members="overlayChatMembers"
								/>

								<app-fireside-desktop-audio
									v-if="shouldPlayDesktopAudio"
									:key="'desktop-audio' + rtc.focusedUser.userId"
									:rtc-user="rtc.focusedUser"
								/>
							</template>
						</div>
					</div>
				</div>

				<div v-if="rtc && shouldShowHosts" class="-hosts-padding">
					<app-fireside-host-list />
				</div>
			</div>

			<template v-if="status === 'loading' || status === 'initial'">
				<div key="loading" class="-message-wrapper">
					<div class="-message">
						<app-illustration src="~img/ill/end-of-feed.svg">
							<app-loading
								centered
								:label="$gettext(`Traveling to the Fireside...`)"
							/>
						</app-illustration>
					</div>
				</div>
			</template>

			<template v-else-if="status === 'unauthorized'">
				<div key="unauthorized" class="-message-wrapper">
					<div class="-message">
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
				</div>
			</template>

			<template v-else-if="status === 'expired'">
				<div key="expired" class="-message-wrapper">
					<div class="-message">
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
				</div>
			</template>

			<template v-else-if="status === 'setup-failed'">
				<div key="setup-failed" class="-message-wrapper">
					<div class="-message">
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
				</div>
			</template>

			<template v-else-if="status === 'disconnected'">
				<div key="disconnected" class="-message-wrapper">
					<div class="-message">
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
				</div>
			</template>

			<template v-else-if="status === 'blocked'">
				<div key="blocked" class="-message-wrapper">
					<div class="-message">
						<div class="text-center">
							<app-jolticon icon="friend-remove-2" big notice />
						</div>
						<div class="text-center">
							<h3>
								<translate> You are blocked from joining this Fireside </translate>
							</h3>
							<p>
								<router-link :to="{ name: 'home' }">
									<small><translate>Return home</translate></small>
								</router-link>
							</p>
						</div>
					</div>
				</div>
			</template>
			<div
				v-else-if="shouldShowChat"
				key="chat"
				class="-chat"
				:class="{ '-trailing': isStreaming }"
			>
				<template v-if="status === 'joined'">
					<div class="-chat-window">
						<app-chat-window-output
							v-if="chatRoom"
							ref="output"
							class="-chat-window-output fill-backdrop"
							:room="chatRoom"
							:messages="chatMessages"
							:queued-messages="chatQueuedMessages"
						/>

						<app-chat-window-send class="-chat-window-input" :room="chatRoom" />
					</div>
				</template>
			</div>
			<div v-if="shouldShowChatMembers" class="-trailing">
				<div class="-chat-members">
					<app-fireside-chat-members :chat-users="chatUsers" :chat-room="chatRoom" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fireside
	change-bg('bg')
	overflow: hidden
	display: flex
	flex-direction: column
	align-items: center
	position: fixed
	top: var(--shell-top)
	bottom: var(--shell-bottom)
	left: var(--shell-left)
	right: var(--shell-right)
	z-index: $zindex-shell-pane-under

.-header
	flex: none
	width: 100%
	max-width: 1800px
	padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: 0 ($grid-gutter-width / 2)

.-split
	flex: none
	height: $border-width-base
	width: 100%
	background-color: var(--theme-bg-subtle)

.-body
	flex: auto
	display: flex
	flex-direction: row
	width: 100%
	max-width: 1800px
	overflow: hidden

	@media $media-md-up
		padding: 16px 0

	&.-is-streaming
		max-width: none

	&-column
		flex-direction: column

		.-video
			flex: none

		.-chat
			flex: auto
			max-width: unset !important

.-leading
.-chat
.-trailing
	display: flex
	flex-direction: column

.-leading
.-trailing
	flex: 1 0
	max-width: 350px
	overflow: hidden
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

	// on MD size, we push the columns to the right
	@media $media-md
		order: 1

	.-is-streaming &
		min-width: 350px
		max-width: 25%

.-chat
	flex: 3 0
	position: relative
	overflow: visible !important

.-fireside-title
	display: flex
	align-items: center

	h2
		text-overflow()
		flex: auto

	&-member-stats
		flex: none
		margin-left: 12px
		margin-right: 24px

	&-controls
		flex: none
		margin-left: 12px
		white-space: nowrap

.-subtitle
	*
		vertical-align: middle

.-avatar
	width: 16px
	height: 16px
	display: inline-block

.-community-avatar
	overflow: hidden
	border-radius: 50%

.-message-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	justify-content: center
	align-items: center
	padding-left: ($grid-gutter-width / 2)
	padding-right: ($grid-gutter-width / 2)

.-message
	rounded-corners-lg()
	elevate-2()
	change-bg('bg-offset')
	padding: 16px
	width: 100%
	max-width: 600px

.-video
	&-wrapper
	&-container
	&-inner
		display: flex
		justify-content: center
		align-items: center

	&-wrapper
		flex: 3 0
		flex-direction: column
		overflow: hidden

		&.-vertical
			flex: 1
			flex-direction: row
			max-height: 33vh

	&-padding
		position: relative
		width: 100%
		height: 100%
		padding: 8px

	&-container
		min-height: 0
		width: 100%
		height: 100%
		position: relative

	&-inner
		rounded-corners-lg()
		elevate-2()
		overflow: hidden
		position: absolute
		background-color: var(--theme-bg-subtle)

.-hosts-padding
	flex: none
	padding-top: 8px
	max-width: 100%
	overflow: hidden

	.-video-wrapper.-vertical &
		padding-top: 0
		padding-right: 8px

.-chat-window
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	flex-direction: column
	overflow: hidden

	@media $media-md-up
		rounded-corners-lg()

	.-is-streaming &
		border-top-right-radius: 0
		border-bottom-right-radius: 0

	&-output
		flex: auto

.-chat-members
	display: flex
	flex-direction: column
	height: 100%
	overflow: hidden

.-stats-btn
	display: inline-block
	position: relative

	&-warn
		change-bg('bg-offset')
		rounded-corners()
		position: absolute
		left: -8px
		top: -8px
		pointer-events: none
		padding: 2px
</style>
