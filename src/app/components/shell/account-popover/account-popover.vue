<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { Client } from '../../../../_common/client/safe-exports';
import { Connection } from '../../../../_common/connection/connection-service';
import { useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatCurrency } from '../../../../_common/filters/currency';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { SettingThemeDark } from '../../../../_common/settings/settings.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useAppStore } from '../../../store';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';
import AppShellUserBox from '../user-box/user-box.vue';

@Options({
	components: {
		AppPopper,
		AppUserAvatarImg,
		AppShellUserBox,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppShellAccountPopover extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	drawer = shallowSetup(() => useDrawerStore());

	themeStore = setup(() => useThemeStore());

	get isDark() {
		return this.themeStore.isDark;
	}

	isShowing = false;
	walletAmount: number | false = false;

	readonly Screen = Screen;
	readonly Connection = Connection;
	readonly formatCurrency = formatCurrency;

	onShow() {
		this.isShowing = true;
		this.getWallet();
	}

	onHide() {
		this.isShowing = false;
	}

	showToken() {
		UserTokenModal.show();
	}

	toggleDark() {
		SettingThemeDark.set(!this.isDark);
		this.themeStore.setDark(!this.isDark);
	}

	async getWallet() {
		const response = await Api.sendRequest('/web/dash/funds/wallet', undefined, {
			detach: true,
		});
		this.walletAmount = response.amount;
	}

	logout() {
		this.store.logout();
	}

	quit() {
		Client?.quit();
	}
}
</script>

<template>
	<AppPopper
		v-if="app.user"
		v-app-track-event="`top-nav:user-menu:toggle`"
		popover-class="fill-darkest"
		fixed
		hide-on-state-change
		@show="onShow()"
		@hide="onHide()"
	>
		<a class="navbar-item navbar-avatar" :class="{ active: isShowing }">
			<AppUserAvatarImg :user="app.user" />
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
						:to="{
							name: GJ_IS_DESKTOP_APP ? 'library.installed' : 'library.overview',
						}"
					>
						<AppTranslate>Game Library</AppTranslate>
					</router-link>
					<router-link
						v-app-track-event="`account-popover:account`"
						class="list-group-item offline-disable"
						:to="{
							name: Screen.isXs ? 'dash.account-mobile-nav' : 'dash.account.edit',
						}"
					>
						<AppTranslate>Edit Account</AppTranslate>
					</router-link>
					<a
						v-app-track-event="`account-popover:token`"
						class="list-group-item offline-disable"
						@click="showToken"
					>
						<AppTranslate>Game Token</AppTranslate>
					</a>
					<router-link
						v-app-track-event="`account-popover:settings`"
						class="list-group-item"
						:to="{ name: 'dash.account.device-settings' }"
					>
						<AppTranslate>Settings</AppTranslate>
					</router-link>
					<a
						v-app-track-event="`account-popover:dark`"
						class="list-group-item"
						@click="toggleDark()"
					>
						<small class="pull-right text-muted">
							<AppTranslate v-if="isDark">on</AppTranslate>
							<AppTranslate v-else>off</AppTranslate>
						</small>
						<AppTranslate>Dark Mode</AppTranslate>
					</a>
				</div>

				<div class="account-popover-separator" />

				<AppShellUserBox />

				<!--
					We don't know if they have revenue until we do the call.
				-->
				<template v-if="walletAmount === false || walletAmount > 0">
					<div class="account-popover-separator" />

					<div class="list-group-dark">
						<div v-if="walletAmount === false" class="list-group-item small">
							<AppTranslate>Loading...</AppTranslate>
						</div>
						<router-link
							v-else
							class="list-group-item small"
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
							<span class="account-popover-currency">
								{{ formatCurrency(walletAmount) }}
							</span>
						</router-link>
					</div>
				</template>

				<!--
					We do slightly different styling here whether we're in client or not.
					Enough changes to require different markup.
				-->
				<template v-if="!GJ_IS_DESKTOP_APP">
					<div class="account-popover-separator" />

					<div class="list-group-dark">
						<a
							v-app-track-event="`account-popover:logout`"
							class="list-group-item text-right"
							@click="logout"
						>
							<AppJolticon icon="logout" notice />
							<AppTranslate>Logout</AppTranslate>
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
									<AppJolticon icon="logout" notice />
									<AppTranslate>Logout</AppTranslate>
								</a>
							</div>
						</div>
						<div class="pull-right text-center" style="width: 50%">
							<div class="list-group-dark">
								<a class="list-group-item" @click="quit()">
									<AppJolticon icon="remove" notice />
									<AppTranslate>Quit</AppTranslate>
								</a>
							</div>
						</div>
					</div>
				</template>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
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
</style>
