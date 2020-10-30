<script lang="ts" src="./account-popover"></script>

<template>
	<app-popper
		v-if="app.user"
		v-app-track-event="`top-nav:user-menu:toggle`"
		popover-class="fill-darkest"
		fixed
		hide-on-state-change
		@show="onShow()"
		@hide="onHide()"
	>
		<a class="navbar-item navbar-avatar" :class="{ active: isShowing }">
			<app-user-avatar-img :user="app.user" />
			<div
				v-if="shouldShowNew"
				class="-new-tag -new-tag-account anim-fade-enter anim-fade-leave"
			/>
		</a>

		<template v-if="isShowing" #popover>
			<div class="account-popover fill-darkest">
				<div class="list-group-dark">
					<router-link
						v-app-track-event="`account-popover:profile`"
						class="list-group-item offline-disable"
						:to="{ name: 'profile.overview', params: { username: app.user.username } }"
					>
						<h4 class="account-popover-heading" :title="$gettext(`View Profile`)">
							{{ app.user.display_name }}
						</h4>
						<small>@{{ app.user.username }}</small>
					</router-link>
				</div>

				<div class="account-popover-separator" />

				<div class="list-group-dark">
					<router-link
						v-app-track-event="`account-popover:library`"
						class="list-group-item"
						:to="{ name: GJ_IS_CLIENT ? 'library.installed' : 'library.overview' }"
					>
						<translate>Game Library</translate>
					</router-link>
					<router-link
						v-app-track-event="`account-popover:account`"
						class="list-group-item offline-disable"
						:to="{
							name: Screen.isXs ? 'dash.account-mobile-nav' : 'dash.account.edit',
						}"
					>
						<translate>Edit Account</translate>
					</router-link>
					<router-link
						v-app-track-event="`account-popover:stickers`"
						class="list-group-item offline-disable"
						:to="{ name: 'dash.stickers' }"
					>
						<translate>Stickers</translate>
						<span v-if="shouldShowNewStickers" class="-new-tag -new-tag-list" />
					</router-link>
					<a
						v-app-track-event="`account-popover:token`"
						class="list-group-item offline-disable"
						@click="showToken"
					>
						<translate>Game Token</translate>
					</a>
					<router-link
						v-app-track-event="`account-popover:settings`"
						class="list-group-item"
						:to="{ name: 'settings' }"
					>
						<translate>Settings</translate>
					</router-link>
					<a
						v-app-track-event="`account-popover:dark`"
						class="list-group-item"
						@click="toggleDark()"
					>
						<small class="pull-right text-muted">
							<translate v-if="isDark">on</translate>
							<translate v-else>off</translate>
						</small>
						<translate>Dark Mode</translate>
					</a>
				</div>

				<div class="account-popover-button offline-disable">
					<app-button
						v-app-track-event="`account-popover:add-game`"
						block
						:to="{ name: 'dash.games.add' }"
					>
						<translate>Add Game</translate>
					</app-button>
				</div>

				<div class="account-popover-separator" />

				<app-shell-user-box />

				<!--
					We don't know if they have revenue until we do the call.
				-->
				<template v-if="walletAmount === false || walletAmount > 0">
					<div class="account-popover-separator" />

					<div class="list-group-dark">
						<div v-if="walletAmount === false" class="list-group-item small">
							<translate>Loading...</translate>
						</div>
						<router-link
							v-else
							class="list-group-item small"
							:to="{ name: 'dash.account.withdraw-funds' }"
						>
							<app-jolticon
								v-app-tooltip.touchable="
									$gettext(
										`These are your available funds to either buy games with or withdraw.`
									)
								"
								class="pull-right"
								icon="help-circle"
							/>

							<translate>Wallet Balance</translate>
							&mdash;
							<span class="account-popover-currency">
								{{ walletAmount | currency }}
							</span>
						</router-link>
					</div>
				</template>

				<!--
				We do slightly different styling here whether we're in client or not.
				Enough changes to require different markup.
			-->
				<template v-if="!GJ_IS_CLIENT">
					<div class="account-popover-separator" />

					<div class="list-group-dark">
						<a
							v-app-track-event="`account-popover:logout`"
							class="list-group-item text-right"
							@click="logout"
						>
							<app-jolticon icon="logout" notice />
							<translate>Logout</translate>
						</a>
					</div>
				</template>
				<template v-else>
					<div class="account-popover-separator" />

					<div class="clearfix">
						<div
							v-if="!Connection.isClientOffline"
							class="pull-left text-center"
							style="width: 50%"
						>
							<div class="list-group-dark">
								<a
									v-app-track-event="`account-popover:logout`"
									class="list-group-item"
									@click="logout"
								>
									<app-jolticon icon="logout" notice />
									<translate>Logout</translate>
								</a>
							</div>
						</div>
						<div class="pull-right text-center" style="width: 50%">
							<div class="list-group-dark">
								<a class="list-group-item" @click="quit()">
									<app-jolticon icon="remove" notice />
									<translate>Quit</translate>
								</a>
							</div>
						</div>
					</div>
				</template>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.account-popover
	min-width: 250px
	$account-popover-padding = 10px

	h4
		margin: 0

	small
		display: block
		color: $dark-theme-fg-muted

	.user-box-exp
		margin-top: -10px
		padding: 0 $account-popover-padding

	&-button
		padding: 10px $account-popover-padding

	&-separator
		change-bg('bg-subtle')
		margin: 10px $account-popover-padding
		height: $border-width-base

	&-currency
		theme-prop('color', 'highlight')

.-new-tag
	border-radius: 50%
	width: 12px
	height: 12px
	display: block
	change-bg('highlight')

	&-account
		position: absolute
		bottom: 10px
		right: 13px
		display: block
		border-color: var(--theme-darkest)
		border-width: 2px
		border-style: solid

	&-list
		float: right
		margin-top: 4px
</style>
