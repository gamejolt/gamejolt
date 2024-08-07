<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { authOnJoin, redirectToOnboarding } from '../../../../_common/auth/auth.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		lazy: true,
		reloadOn: 'always',
		resolver: ({ route }) => {
			const { userId, code, type } = route.params;
			return Api.sendRequest(`/web/auth/authorize/${userId}/${code}/${type}`);
		},
	}),
};
</script>

<script lang="ts" setup>
const isSuccess = ref(false);
// routeTitle wants access to isBootstrapped from the app route, but the
// declaration order was breaking things. Use this instead of isBootstrapped,
// the timing should be pretty much the same.
const isRouteResolved = ref(false);

const routeTitle = computed(() => {
	if (!isRouteResolved.value) {
		return $gettext('Just one moment...');
	}

	if (isSuccess.value) {
		return $gettext('Redirecting...');
	}

	return $gettext('Invalid Authorization Code');
});

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		isRouteResolved.value = true;

		isSuccess.value = payload.success === true;
		if (!isSuccess.value) {
			return;
		}

		// Redirect them to onboarding.
		authOnJoin('email');
		redirectToOnboarding();
	},
});
</script>

<template>
	<AppLoading v-if="!isBootstrapped" :label="$gettext('Just one moment...')" centered big />
	<div v-else class="anim-fade-in-up">
		<template v-if="isSuccess">
			<h2 class="section-header">
				{{ $gettext(`Account Authorized`) }}
			</h2>
			<div>
				{{ $gettext(`We're redirecting you to your Game Jolt dashboard now.`) }}
			</div>
		</template>
		<template v-else>
			<h2 class="section-header">
				{{ $gettext(`Invalid Authorization`) }}
			</h2>
			<div>
				<p>
					{{ $gettext(`Your authorization code is invalid.`) }}
				</p>
				<p>
					{{
						$gettext(
							`Please make sure to copy and paste the full URL that we emailed you.`
						)
					}}
				</p>
			</div>
		</template>
	</div>
</template>
