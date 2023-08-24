<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { GameModel } from '../../../_common/game/game.model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { $gettext, $gettextInterpolate } from '../../../_common/translate/translate.service';
import AppInvalidKey from '../../components/AppInvalidKey.vue';
import FormRetrieve from '../../components/forms/FormRetrieve.vue';

interface SuccessPayload {
	error: false;
	type: 'game' | 'bundle';
	key: string;
	payload?: any;
}

interface ErrorPayload {
	error: true;
}

type Payload = SuccessPayload | ErrorPayload | undefined;

defineOptions(
	defineAppRouteOptions({
		async resolver({ route }): Promise<Payload> {
			let type: 'game' | 'bundle' | undefined;
			let key = '';

			// Retrieving all keys. We don't need to call the API.
			if (!route.params.input) {
				return undefined;
			}

			const matches = String(route.params.input).match(/(g|b)-([0-9a-zA-Z]+)/);
			if (matches) {
				if (matches[1] === 'g') {
					type = 'game';
				} else if (matches[1] === 'b') {
					type = 'bundle';
				}
			}

			// Invalid key passed in.
			if (!matches || !type) {
				return { error: true };
			}

			key = matches[2];

			// Retrieving a key for a particular bundle or game.
			return {
				error: false,
				type,
				key,
				payload: await Api.sendRequest(`/claim/retrieve/${type}/${key}`),
			};
		},
	})
);

const invalidKey = ref(false);
const key = ref('');
const bundle = ref<GameBundleModel>();
const game = ref<GameModel>();
const resourceTitle = ref('');

const router = useRouter();

createAppRoute({
	routeTitle: computed(() => {
		if (resourceTitle.value) {
			return $gettextInterpolate(`Retrieve Your Keys for %{ resource }`, {
				resource: resourceTitle.value,
			});
		}

		return $gettext(`Retrieve Your Keys`);
	}),
	onResolved({ payload }: { payload: Payload }) {
		// Invalid key.
		if (payload && (payload.error || payload.payload.error)) {
			invalidKey.value = true;
			return;
		}

		// Retrieving a key for a particular bundle or game.
		if (payload && !payload.error) {
			const {
				payload: { bundle: bundleData, game: gameData },
			} = payload;

			key.value = payload.key;
			bundle.value = bundleData ? new GameBundleModel(bundleData) : undefined;
			game.value = gameData ? new GameModel(gameData) : undefined;
		}

		resourceTitle.value = '';
		if (bundle.value) {
			resourceTitle.value = bundle.value.title;
		} else if (game.value) {
			resourceTitle.value = game.value.title;
		}
	},
});

function onSubmit() {
	router.push({ name: 'sent-key' });
}
</script>

<template>
	<div>
		<AppInvalidKey v-if="invalidKey" />

		<section v-else class="container">
			<h1 class="section-header">
				<template v-if="!resourceTitle">
					{{ $gettext(`Retrieve Your Keys`) }}
				</template>
				<template v-else>
					{{
						$gettextInterpolate(`Retrieve Your Keys for %{ resource }`, {
							resource: resourceTitle,
						})
					}}
				</template>
			</h1>

			<p>
				<template v-if="!resourceTitle">
					{{ $gettext(`Please enter your email address to retrieve your keys.`) }}
				</template>
				<template v-if="resourceTitle">
					<span v-translate="{ resource: resourceTitle }">
						Please enter your email address to retrieve your keys for
						<b>%{ resource }</b>
						.
					</span>
				</template>
				{{ ' ' }}
				{{ $gettext(`We will email you a link to your download(s).`) }}
			</p>

			<FormRetrieve :key-id="key" :bundle="bundle" :game="game" @submit="onSubmit" />
		</section>
	</div>
</template>
