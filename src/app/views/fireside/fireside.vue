<script lang="ts" src="./fireside"></script>

<template>
	<app-fireside-container v-if="c" :controller="c" class="-fireside">
		<app-fireside-banner />

		<template v-if="!shouldShowHeaderInBody">
			<app-fireside-header
				class="-header"
				:show-controls="shouldShowTitleControls"
				:has-info="!shouldShowFiresideStats"
				:has-chat="!shouldShowChatMembers"
				:has-chat-stats="shouldShowChatMemberStats"
			/>
			<div class="-split" />
		</template>
		<div
			class="-body"
			:class="{ '-body-column': isVertical && c.isStreaming, '-is-streaming': c.isStreaming }"
		>
			<div v-if="shouldShowFiresideStats" class="-leading">
				<app-fireside-stats />
			</div>

			<div
				v-if="c.isStreaming && c.chatRoom"
				class="-video-wrapper"
				:class="{
					'-vertical': isVertical,
					'-fullscreen': shouldFullscreenStream,
					'-has-cbar': !Screen.isXs,
				}"
			>
				<div class="-video-padding">
					<div
						ref="videoWrapper"
						v-app-observe-dimensions="onDimensionsChange"
						class="-video-container"
					>
						<app-sticker-target
							:controller="c.stickerTargetController"
							class="-video-inner"
							:class="{
								'-unsupported': GJ_IS_CLIENT,
							}"
							:style="{
								width: videoWidth + 'px',
								height: videoHeight + 'px',
							}"
						>
							<template v-if="GJ_IS_CLIENT">
								<app-illustration
									v-if="shouldShowHosts && shortestSide > 700"
									src="~img/ill/no-comments.svg"
								/>

								<p class="-unsupported-text">
									<translate>
										Oh no... Fireside streams don't work on the Client yet.
									</translate>
								</p>

								<app-button @click="onClickOpenBrowser()">
									<translate>Open Fireside in Browser</translate>
								</app-button>
							</template>
							<template v-else-if="c.rtc && c.rtc.focusedUser">
								<app-popper trigger="right-click">
									<app-fireside-stream
										:rtc-user="c.rtc.focusedUser"
										:show-overlay-hosts="!shouldShowHosts"
										:members="overlayChatMembers"
									/>

									<template #popover>
										<div class="list-group">
											<a class="list-group-item" @click="toggleVideoStats()">
												<translate>Toggle Video Stats</translate>
											</a>
										</div>
									</template>
								</app-popper>
							</template>
						</app-sticker-target>
					</div>
				</div>

				<div v-if="c.rtc && shouldShowHosts" class="-hosts-padding">
					<div class="-hosts">
						<app-fireside-host-list @sticker="onClickPlaceSticker" />
					</div>

					<app-fireside-share v-if="!c.isDraft" class="-share" hide-heading />
				</div>
			</div>

			<template v-if="c.status === 'loading' || c.status === 'initial'">
				<div key="loading" class="-message-wrapper">
					<div class="-message">
						<app-illustration src="~img/ill/end-of-feed.svg">
							<app-loading
								centered
								:label="$gettext(`Traveling to the fireside...`)"
							/>
						</app-illustration>
					</div>
				</div>
			</template>

			<template v-else-if="c.status === 'unauthorized'">
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

			<template v-else-if="c.status === 'expired'">
				<div key="expired" class="-message-wrapper">
					<div class="-message">
						<app-illustration src="~img/ill/no-comments-small.svg">
							<p>
								<translate>This fireside's fire has burned out.</translate>
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

			<template v-else-if="c.status === 'setup-failed'">
				<div key="setup-failed" class="-message-wrapper">
					<div class="-message">
						<app-illustration src="~img/ill/maintenance.svg">
							<p>
								<translate>Could not reach this fireside.</translate>
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

			<template v-else-if="c.status === 'disconnected'">
				<div key="disconnected" class="-message-wrapper">
					<div class="-message">
						<app-illustration src="~img/ill/no-comments-small.svg">
							<p>
								<translate>
									You have been disconnected from fireside services.
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

			<template v-else-if="c.status === 'blocked'">
				<div key="blocked" class="-message-wrapper">
					<div class="-message">
						<div class="text-center">
							<app-jolticon icon="friend-remove-2" big notice />
						</div>
						<div class="text-center">
							<h3>
								<translate>You are blocked from joining this fireside</translate>
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
				:class="{ '-trailing': c.isStreaming }"
			>
				<app-sticker-reactions :controller="c.stickerTargetController" />

				<app-expand v-if="shouldShowHeaderInBody" :when="c.isShowingStreamOverlay">
					<app-fireside-header
						class="-header"
						has-overlay-popovers
						:show-controls="shouldShowTitleControls"
						:has-chat="!shouldShowChatMembers"
						:has-chat-stats="shouldShowChatMemberStats"
					/>
				</app-expand>

				<div v-if="c.status === 'joined'" class="-chat-wrapper">
					<div class="-chat-window">
						<app-chat-window-output
							v-if="c.chatRoom"
							ref="output"
							class="-chat-window-output fill-backdrop"
							:room="c.chatRoom"
							:messages="chatMessages"
							:queued-messages="chatQueuedMessages"
						/>

						<div v-if="!user" class="-login fill-backdrop">
							<div class="alert">
								<p>
									You must be
									<a v-app-auth-required :href="loginUrl">logged in</a>
									to Game Jolt to chat.
								</p>
							</div>
						</div>
						<app-chat-window-send
							v-else-if="chat && chat.currentUser"
							class="-chat-window-input"
							:room="c.chatRoom"
						/>
					</div>
				</div>
			</div>
			<div v-if="shouldShowChatMembers" class="-trailing">
				<div class="-chat-members">
					<app-fireside-chat-members :chat-users="c.chatUsers" :chat-room="c.chatRoom" />
				</div>
			</div>
		</div>
	</app-fireside-container>
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
		display: grid
		grid-template-rows: calc(min(33vh, calc((100vw / 1.7777)))) 1fr
		grid-template-columns: 100%
		padding: 0

		.-chat
			max-width: unset !important

		.-chat-window
			border-radius: 0

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

.-fullscreen
	position: fixed
	left: 0
	top: $shell-top-nav-height
	right: 0
	bottom: 0
	z-index: $zindex-shell-hot-bottom + 1
	background-color: $black

	&.-has-cbar
		left: $shell-cbar-width

.-video-wrapper
.-video-container
.-video-inner
	display: flex
	justify-content: center
	align-items: center

.-video-wrapper
	flex: 3 0
	flex-direction: column
	overflow: hidden

	&.-vertical
		flex-direction: row
		flex: none

.-video-padding
	position: relative
	width: 100%
	height: 100%
	padding: 8px

	.-fullscreen &
	.-body-column &
		background-color: $black
		padding: 0

.-video-container
	min-height: 0
	width: 100%
	height: 100%
	position: relative

.-video-inner
	overflow: hidden
	position: absolute
	flex-direction: column

	&.-unsupported
		padding: $line-height-computed

	&:not(.-unsupported)
		rounded-corners-lg()
		elevate-2()
		background-color: var(--theme-bg-subtle)
		-webkit-transform: translateZ(0)

	.-fullscreen &
	.-body-column &
		border-radius: 0

.-unsupported-text
	color: var(--theme-fg-muted)
	text-align: center
	font-weight: 600

.-hosts-padding
	flex: none
	width: 100%
	padding-top: 8px
	max-width: 100%
	overflow: hidden
	display: inline-flex
	align-items: flex-start
	grid-gap: 16px

	.-hosts
		min-width: 0
		margin-left: auto
		margin-right: auto

	.-share
		margin-right: 8px
		flex: none

	> *
		margin-top: 0 !important
		margin-bottom: 0 !important

	.-video-wrapper.-vertical &
		padding-top: 0
		padding-right: 8px

.-chat-wrapper
	position: relative
	height: 100%

	.-body-column &
	.-is-streaming &
		margin-left: -($grid-gutter-width-xs / 2)
		margin-right: -($grid-gutter-width-xs / 2)

		@media $media-sm-up
			margin-left: -($grid-gutter-width / 2)
			margin-right: -($grid-gutter-width / 2)

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

.-login
	padding: ($grid-gutter-width-xs / 2)

	> *
		margin: 0

	@media $media-sm-up
		padding: ($grid-gutter-width / 2)
</style>
