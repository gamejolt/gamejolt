<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import { Environment } from '../../../_common/environment/environment.service';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { GameModel } from '../../../_common/game/game.model';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../_common/modal/confirm/confirm-service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettext, $gettextInterpolate } from '../../../_common/translate/translate.service';
import AppInvalidKey from '../../components/AppInvalidKey.vue';
import AppKeyBundle from './AppKeyBundle.vue';
import AppKeyGame from './AppKeyGame.vue';

defineOptions(
	defineAppRouteOptions({
		resolver: async ({ route }) => {
			let url = '/claim/view/' + route.params.accessKey;

			if (route.query.bundleGameId) {
				url += '?game_id=' + route.query.bundleGameId;
			}

			return Api.sendRequest(url);
		},
	})
);

const { user } = useCommonStore();
const route = useRoute();

// Use payload here so that the children can be reactive to it.
const routePayload = ref<any>(null);
const invalidKey = ref(false);
const type = ref('');

const accessKey = computed(() => String(route.params.accessKey));
const loginUrl = computed(
	() => Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(route.fullPath)
);
const component = computed(() =>
	type.value === 'bundle' && !route.query.bundleGameId ? AppKeyBundle : AppKeyGame
);

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (routePayload.value) {
			if (type.value === 'bundle') {
				return $gettextInterpolate(`Key Page for %{ bundle }`, {
					bundle: routePayload.value.bundle.title,
				});
			} else if (type.value === 'game') {
				return $gettextInterpolate(`Key Page for %{ game }`, {
					game: routePayload.value.game.title,
				});
			} else if (type.value === 'bundle-game' && routePayload.value.bundle) {
				return $gettextInterpolate(`Key Page for %{ game } in %{ bundle }`, {
					game: routePayload.value.game.title,
					bundle: routePayload.value.bundle.title,
				});
			}
		}

		return null;
	}),
	onInit() {
		routePayload.value = null;
		type.value = '';
	},
	onResolved({ payload }) {
		if (payload.error === 'invalid-key') {
			invalidKey.value = true;
			return;
		}

		routePayload.value = payload;
		type.value = payload.type;
	},
});

async function claim(resource: GameModel | GameBundleModel) {
	const resourceName = resource instanceof GameBundleModel ? 'bundle' : 'game';

	const result = await showModalConfirm(
		$gettextInterpolate(
			`Claiming this %{ type } into your Library will allow you to access it through your Game Jolt account and invalidate this key page.`,
			{ type: resourceName }
		),
		undefined,
		'ok'
	);

	if (!result || !user.value) {
		return;
	}

	try {
		const response = await Api.sendRequest(
			'/web/library/claim-key',
			{ key: accessKey.value },
			{ detach: true }
		);

		if (response && !response.success && response.reason === 'already-claimed-in-group') {
			invalidKey.value = true;
			showErrorGrowl($gettext(`You already claimed a key for that!`));
			return;
		}

		let location = '';
		if (resource instanceof GameBundleModel) {
			location =
				Environment.wttfBaseUrl + `/library/bundle/${resource.slug}/${resource.id}/games`;
		} else if (resource instanceof GameModel) {
			location =
				Environment.wttfBaseUrl + `/profile/${user.value.slug}/${user.value.id}/owned`;
		}

		if (location) {
			Navigate.goto(location);
		}
	} catch (_e) {
		showErrorGrowl($gettext(`For some reason we couldn't claim this into your account!`));
	}
}
</script>

<template>
	<div v-if="isBootstrapped">
		<AppInvalidKey v-if="invalidKey" />
		<section v-else class="container">
			<component
				:is="component"
				v-if="routePayload"
				:access-key="accessKey"
				:payload="routePayload"
				:login-url="loginUrl"
				@claim="claim"
			/>
		</section>
	</div>
</template>
