<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { Client } from '../../../_common/client/safe-exports';
import { formatCurrency, formatGemsCurrency } from '../../../_common/filters/currency';
import { showInviteModal } from '../../../_common/invite/modal/modal.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../_common/screen/screen-service';
import { SettingThemeDark } from '../../../_common/settings/settings.service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppUserAvatarBubble from '../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserWalletModel } from '../../../_common/user/wallet/wallet.model';
import { useAppStore } from '../../store';
import { routeDashCreator } from '../../views/dashboard/creator/creator.route';
import { showUserTokenModal } from '../user/token-modal/token-modal.service';

const { logout } = useAppStore();
const { user } = useCommonStore();
const { isDark, setDark } = useThemeStore();

const isShowing = ref(false);

const isFetchingWallet = ref(true);
const marketplaceAmount = ref(0);
const gemWallet = ref<UserWalletModel>();

function onShow() {
	isShowing.value = true;
	_getWallet();
}

function onHide() {
	isShowing.value = false;
}

function showToken() {
	showUserTokenModal();
}

function toggleDark() {
	SettingThemeDark.set(!isDark.value);
	setDark(!isDark.value);
}

async function _getWallet() {
	const response = await Api.sendFieldsRequest(
		'/mobile/me',
		{
			marketplaceWalletBalance: true,
			gemWallet: true,
		},
		{
			detach: true,
		}
	);

	marketplaceAmount.value = response.marketplaceWalletBalance || 0;
	gemWallet.value = response.gemWallet ? new UserWalletModel(response.gemWallet) : undefined;
	isFetchingWallet.value = false;
}

function openInviteModal() {
	showInviteModal({ user: user.value! });
}

function quit() {
	Client?.quit();
}
</script>

<template>
	<AppPopper
		v-if="user"
		v-app-track-event="`top-nav:user-menu:toggle`"
		popover-class="fill-darkest"
		fixed
		hide-on-state-change
		@show="onShow()"
		@hide="onHide()"
	>
		<a class="navbar-item navbar-avatar" :class="{ active: isShowing }">
			<AppUserAvatarBubble :user="user" disable-link show-frame />
		</a>

		<template v-if="isShowing" #popover>
			<div class="account-popover fill-darkest">
				<div class="list-group-dark">
					<RouterLink
						v-app-track-event="`account-popover:profile`"
						class="list-group-item offline-disable"
						:to="{ name: 'profile.overview', params: { username: user.username } }"
					>
						<h4 class="-heading" :title="$gettext(`View profile`)">
							{{ user.display_name }}
						</h4>
						<div class="-small-text">
							<strong>@{{ user.username }}</strong>
						</div>
					</RouterLink>
				</div>

				<div class="-separator" />
				<AppSpacer vertical :scale="3" />

				<div class="-quick-actions">
					<RouterLink
						v-if="user.is_creator"
						class="-quick-action"
						:to="{ name: routeDashCreator.name }"
					>
						<AppJolticon class="-quick-action-icon" icon="dashboard" />
						<div class="-quick-action-label">
							{{ $gettext(`Creator HUD`) }}
						</div>
					</RouterLink>
					<RouterLink
						class="-quick-action"
						:to="{ name: 'profile.trophies', params: { username: user.username } }"
					>
						<AppJolticon class="-quick-action-icon" icon="trophy" />
						<div class="-quick-action-label">
							<AppTranslate>Trophies</AppTranslate>
						</div>
					</RouterLink>
				</div>

				<AppSpacer vertical :scale="3" />
				<div class="-separator" />

				<div class="list-group-dark">
					<RouterLink
						v-app-track-event="`account-popover:profile`"
						class="list-group-item"
						:to="{ name: 'profile.overview', params: { username: user.username } }"
					>
						<AppTranslate>Profile</AppTranslate>
					</RouterLink>
					<RouterLink
						v-app-track-event="`account-popover:library`"
						class="list-group-item"
						:to="{
							name: GJ_IS_DESKTOP_APP ? 'library.installed' : 'library.overview',
						}"
					>
						<AppTranslate>Games</AppTranslate>
					</RouterLink>
					<RouterLink
						v-app-track-event="`account-popover:account`"
						class="list-group-item offline-disable"
						:to="{
							name: Screen.isXs ? 'dash.account-mobile-nav' : 'dash.account.edit',
						}"
					>
						<AppTranslate>Settings</AppTranslate>
					</RouterLink>
					<RouterLink
						v-if="user.is_developer || user.is_creator"
						v-app-track-event="`account-popover:analytics`"
						class="list-group-item offline-disable"
						:to="{
							name: 'dash.analytics',
							params: {
								resource: 'User',
								resourceId: user.id,
							},
						}"
					>
						<AppTranslate>Analytics</AppTranslate>
					</RouterLink>
					<a
						v-app-track-event="`account-popover:token`"
						class="list-group-item offline-disable"
						@click="showToken"
					>
						<AppTranslate>Game Token</AppTranslate>
					</a>
					<a
						v-app-track-event="`account-popover:dark`"
						class="list-group-item"
						@click="toggleDark()"
					>
						<div class="pull-right -small-text">
							<AppTranslate v-if="isDark">on</AppTranslate>
							<AppTranslate v-else>off</AppTranslate>
						</div>
						<AppTranslate>Dark Mode</AppTranslate>
					</a>

					<!--
					We don't know if they have revenue until we do the call.
					-->
					<template
						v-if="isFetchingWallet === true || marketplaceAmount > 0 || gemWallet"
					>
						<div v-if="isFetchingWallet" class="list-group-item">
							<AppTranslate>Loading...</AppTranslate>
						</div>
						<RouterLink
							v-else
							class="-wallet list-group-item"
							:to="{ name: 'dash.account.wallet' }"
						>
							<span>
								<AppTranslate>Wallet</AppTranslate>
							</span>

							<span class="-wallet-spacer" />

							<template v-if="gemWallet">
								<span class="-wallet-icon -gem-icon">
									<AppJolticon icon="gem" />
								</span>
								<span>
									{{ formatGemsCurrency(gemWallet.available_balance) }}
								</span>
							</template>

							<template v-if="marketplaceAmount > 0">
								<span class="-wallet-icon -marketplace-icon">
									<AppJolticon icon="marketplace-filled" />
								</span>
								<span>
									{{ formatCurrency(marketplaceAmount) }}
								</span>
							</template>
						</RouterLink>
					</template>
				</div>

				<div class="-invite-well">
					<AppButton block primary solid @click="openInviteModal()">
						<AppTranslate>Invite a friend</AppTranslate>
					</AppButton>
				</div>

				<div class="-separator" />

				<div class="-session-actions list-group-dark">
					<a
						v-app-track-event="`account-popover:logout`"
						class="-session-action list-group-item"
						@click="logout"
					>
						<AppJolticon icon="logout" notice />
						<AppTranslate>Logout</AppTranslate>
					</a>
					<a
						v-if="GJ_IS_DESKTOP_APP"
						class="-session-action list-group-item"
						@click="quit"
					>
						<AppJolticon icon="remove" notice />
						<AppTranslate>Quit</AppTranslate>
					</a>
				</div>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.account-popover
	min-width: 250px

.-small-text
	display: block
	color: $dark-theme-fg-muted
	font-size: 13px

.-heading
	margin: 0

.-wallet
	display: flex
	flex-direction: row

.-wallet-spacer
	flex: auto

.-wallet-icon
	margin-left: 16px

.-gem-icon
	color: $gj-blue

.-marketplace-icon
	color: $gj-green

.-separator
	margin: 0 $list-group-item-padding
	height: $border-width-base
	background-color: var(--theme-bg-subtle)

.-quick-actions
	display: flex
	flex-direction: row
	justify-content: space-evenly
	align-items: center

.-quick-action
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	color: var(--theme-fg)

.-quick-action-icon
	font-size: 24px

.-quick-action-label
	margin-top: 8px
	font-size: 11px
	font-weight: bold

.-quick-action-new
	position: absolute
	top: -4px
	right: 0
	width: 8px
	height: 8px
	border-radius: 50%
	background-color: var(--theme-highlight)

.-session-actions
	display: flex

.-session-action
	display: flex
	flex: auto
	align-items: center
	gap: 8px

.-invite-well
	padding: $list-group-item-padding
</style>
