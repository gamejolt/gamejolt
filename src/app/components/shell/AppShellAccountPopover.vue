<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import { Client } from '../../../_common/client/safe-exports';
import { formatCurrency } from '../../../_common/filters/currency';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../_common/screen/screen-service';
import { SettingThemeDark } from '../../../_common/settings/settings.service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppUserAvatarImg from '../../../_common/user/user-avatar/img/img.vue';
import { useAppStore } from '../../store';
import { UserTokenModal } from '../user/token-modal/token-modal.service';

const { logout, hasNewUnlockedStickers } = useAppStore();
const { user } = useCommonStore();
const { isDark, setDark } = useThemeStore();

const isShowing = ref(false);
const walletAmount = ref<number | false>(false);

function onShow() {
	isShowing.value = true;
	_getWallet();
}

function onHide() {
	isShowing.value = false;
}

function showToken() {
	UserTokenModal.show();
}

function toggleDark() {
	SettingThemeDark.set(!isDark.value);
	setDark(!isDark.value);
}

async function _getWallet() {
	const response = await Api.sendRequest('/web/dash/funds/wallet', undefined, {
		detach: true,
	});
	walletAmount.value = response.amount;
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
			<AppUserAvatarImg :user="user" />
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
					<RouterLink class="-quick-action" :to="{ name: 'dash.stickers' }">
						<AppJolticon class="-quick-action-icon" icon="sticker-filled" />
						<div class="-quick-action-label">
							<AppTranslate>Stickers</AppTranslate>
						</div>
						<div v-if="hasNewUnlockedStickers" class="-quick-action-new" />
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
					<template v-if="walletAmount === false || walletAmount > 0">
						<div v-if="walletAmount === false" class="list-group-item">
							<AppTranslate>Loading...</AppTranslate>
						</div>
						<RouterLink
							v-else
							class="list-group-item"
							:to="{ name: 'dash.account.withdraw-funds' }"
						>
							<AppJolticon
								v-app-tooltip.touchable="
									$gettext(
										`These are your available funds to either buy games with or withdraw.`
									)
								"
								class="pull-right"
								icon="help-circle"
							/>

							<AppTranslate>Wallet Balance</AppTranslate>
							&mdash;
							<span class="-currency">
								{{ formatCurrency(walletAmount) }}
							</span>
						</RouterLink>
					</template>
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

.-currency
	theme-prop('color', 'highlight')

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
</style>
