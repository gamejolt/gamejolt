<script lang="ts">
import { inject, InjectionKey, ref } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppEditableOverlay from '../../../../_common/editable-overlay/editable-overlay.vue';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
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
@RouteResolver({
	deps: {},
	// We want to reload this data every time we come into this section.
	resolver: () => Api.sendRequest('/web/dash/account'),
})
export default class RouteDashAccount extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);
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
			<app-button block icon="chevron-left" :to="{ name: 'dash.account-mobile-nav' }">
				<translate>Back to Account</translate>
			</app-button>
		</div>

		<app-page-header>
			<h1>{{ heading }}</h1>

			<p>
				<small>@{{ user.username }}</small>
			</p>

			<template v-if="!Screen.isXs" #spotlight>
				<app-editable-overlay
					class="-fill"
					:disabled="$route.name !== 'dash.account.edit'"
					@click="showEditAvatar()"
				>
					<template #overlay>
						<translate>Change</translate>
					</template>
					<app-user-avatar :user="user" />
				</app-editable-overlay>
			</template>
		</app-page-header>

		<app-expand :when="$route.name === 'dash.account.edit'">
			<app-editable-overlay @click="showEditHeader()">
				<template #overlay>
					<translate>Change Profile Header</translate>
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
					<app-media-item-cover
						v-if="user.header_media_item"
						:media-item="user.header_media_item"
						:max-height="400"
					/>
				</div>
			</app-editable-overlay>
		</app-expand>

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
										<translate>Profile</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.site' }"
										active-class="active"
									>
										<translate>Portfolio Site</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.blocks' }"
										active-class="active"
									>
										<translate>Blocked Users</translate>
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
										<translate>Linked Accounts</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.email-preferences' }"
										active-class="active"
									>
										<translate>Email Preferences</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.change-password' }"
										active-class="active"
									>
										<translate>Password</translate>
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
										<translate>Payment Methods</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.addresses' }"
										active-class="active"
									>
										<translate>Saved Addresses</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.purchases.list' }"
										active-class="active"
									>
										<translate>Purchases</translate>
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
										<translate>Marketplace Account Setup</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'dash.account.withdraw-funds' }"
										active-class="active"
									>
										<translate>Revenue</translate>
									</router-link>
								</li>
							</ul>
						</nav>
					</div>
					<div class="col-xs-12 col-sm-9 col-md-10">
						<template v-if="Screen.isXs && $route.name === 'dash.account.edit'">
							<app-editable-overlay class="-avatar-xs" @click="showEditAvatar()">
								<template #overlay>
									<translate>Change</translate>
								</template>
								<app-user-avatar :user="user" />
							</app-editable-overlay>

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
