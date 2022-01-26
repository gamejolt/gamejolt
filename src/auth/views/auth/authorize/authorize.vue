<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { authOnLogin, redirectToOnboarding } from '../../../../_common/auth/auth.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthAuthorize',
})
@RouteResolver({
	lazy: true,
	resolver({ route }) {
		const { userId, code, type } = route.params;
		return Api.sendRequest(`/web/auth/authorize/${userId}/${code}/${type}`);
	},
})
export default class RouteAuthAuthorize extends BaseRouteComponent {
	isSuccess = false;

	get routeTitle() {
		if (this.isRouteLoading) {
			return this.$gettext('Just one moment...');
		}

		if (this.isSuccess) {
			return this.$gettext('Redirecting...');
		}

		return this.$gettext('Invalid Authorization Code');
	}

	routeResolved($payload: any) {
		this.isSuccess = $payload.success;

		// Redirect them to onboarding.
		if (this.isSuccess) {
			authOnLogin('email');
			redirectToOnboarding();
		}
	}
}
</script>

<template>
	<AppLoading :label="$gettext('Just one moment...')" centered big v-if="isRouteLoading" />
	<div class="anim-fade-in-up" v-else>
		<template v-if="isSuccess">
			<h2 class="section-header">
				<AppTranslate>auth.authorize.success_growl_title</AppTranslate>
			</h2>
			<div>
				<AppTranslate>auth.authorize.success_growl</AppTranslate>
			</div>
		</template>
		<template v-else>
			<h2 class="section-header">
				<AppTranslate>auth.authorize.invalid.heading</AppTranslate>
			</h2>
			<div>
				<p><AppTranslate>Your authorization code is invalid.</AppTranslate></p>
				<p>
					<AppTranslate>
						Please make sure to copy and paste the full URL that we emailed you.
					</AppTranslate>
				</p>
			</div>
		</template>
	</div>
</template>
