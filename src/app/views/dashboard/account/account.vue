<script lang="ts">
import { inject, InjectionKey, provide, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppEditableOverlay from '../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';

const Key: InjectionKey<Controller> = Symbol('account-route');

type Controller = ReturnType<typeof createController>;

export function useAccountRouteController() {
	return inject(Key);
}

function createController() {
	const heading = ref('');
	return { heading };
}

@Options({
	name: 'RouteDashAccount',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppExpand,
		AppMediaItemCover,
		AppEditableOverlay,
	},
})
@OptionsForRoute({
	deps: {},
	// We want to reload this data every time we come into this section.
	resolver: () => Api.sendRequest('/web/dash/account'),
})
export default class RouteDashAccount extends BaseRouteComponent {
	routeStore = setup(() => {
		const c = createController();
		provide(Key, c);
		return c;
	});
	commonStore = setup(() => useCommonStore());

	readonly Screen = Screen;

	get user() {
		return this.commonStore.user!;
	}

	get heading() {
		return this.routeStore.heading;
	}

	routeResolved(payload: any) {
		this.commonStore.setUser(payload.user);
	}

	showEditHeader() {
		UserHeaderModal.show();
	}

	showEditAvatar() {
		UserAvatarModal.show();
	}
}
</script>

<template>
	<div>
		<div v-if="Screen.isXs" class="well fill-darker sans-margin-bottom">
			<AppButton block icon="chevron-left" :to="{ name: 'dash.account-mobile-nav' }">
				<AppTranslate>Back to Account</AppTranslate>
			</AppButton>
		</div>

		<AppPageHeader>
			<h1>{{ heading }}</h1>

			<p>
				<small>@{{ user.username }}</small>
			</p>

			<template v-if="!Screen.isXs" #spotlight>
				<AppEditableOverlay
					class="-fill"
					:disabled="$route.name !== 'dash.account.edit'"
					@click="showEditAvatar()"
				>
					<template #overlay>
						<AppTranslate>Change</AppTranslate>
					</template>
					<AppUserAvatar :user="user" />
				</AppEditableOverlay>
			</template>
		</AppPageHeader>

		<AppExpand :when="$route.name === 'dash.account.edit'">
			<AppEditableOverlay @click="showEditHeader()">
				<template #overlay>
					<AppTranslate>Change Profile Header</AppTranslate>
				</template>

				<!--
					If no header yet, show their highlight color with a min-height.
				-->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !user.header_media_item ? '200px' : '',
					}"
				>
					<AppMediaItemCover
						v-if="user.header_media_item"
						:media-item="user.header_media_item"
						:max-height="400"
					/>
				</div>
			</AppEditableOverlay>
		</AppExpand>

		<!-- Don't show content before this route has loaded in the account data. -->
		<section v-if="isRouteBootstrapped" class="section">
			<div class="container">
				<div class="row">
					<div v-if="!Screen.isXs" class="col-sm-3 col-md-2">
						<nav class="platform-list">
							<ul>
								<li>
									<router-link
										:to="{ name: 'dash.account.edit' }"
										active-class="active"
									>
										<AppTranslate>Profile</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.device-settings' }"
										active-class="active"
									>
										<AppTranslate>Device Settings</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.blocks' }"
										active-class="active"
									>
										<AppTranslate>Blocked Users</AppTranslate>
									</router-link>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<router-link
										:to="{ name: 'dash.account.linked-accounts' }"
										active-class="active"
									>
										<AppTranslate>Linked Accounts</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.email-preferences' }"
										active-class="active"
									>
										<AppTranslate>Email Preferences</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.change-password' }"
										active-class="active"
									>
										<AppTranslate>Password</AppTranslate>
									</router-link>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<router-link
										:to="{ name: 'dash.account.payment-methods' }"
										active-class="active"
									>
										<AppTranslate>Payment Methods</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.addresses' }"
										active-class="active"
									>
										<AppTranslate>Saved Addresses</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.purchases.list' }"
										active-class="active"
									>
										<AppTranslate>Purchases</AppTranslate>
									</router-link>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<router-link
										:to="{ name: 'dash.account.financials' }"
										active-class="active"
									>
										<AppTranslate>Marketplace Account Setup</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.withdraw-funds' }"
										active-class="active"
									>
										<AppTranslate>Revenue</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.site' }"
										active-class="active"
									>
										<AppTranslate>Portfolio Site</AppTranslate>
									</router-link>
								</li>
							</ul>
						</nav>
					</div>
					<div class="col-xs-12 col-sm-9 col-md-10">
						<template v-if="Screen.isXs && $route.name === 'dash.account.edit'">
							<AppEditableOverlay class="-avatar-xs" @click="showEditAvatar()">
								<template #overlay>
									<AppTranslate>Change</AppTranslate>
								</template>
								<AppUserAvatar :user="user" />
							</AppEditableOverlay>

							<hr />
						</template>

						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-avatar-xs
	margin: 0 auto
	max-width: 200px
	border-radius: 50%
	overflow: hidden
</style>
