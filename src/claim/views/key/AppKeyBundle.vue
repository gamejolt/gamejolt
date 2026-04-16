<script lang="ts" setup>
import { ref } from 'vue';

import AppButton from '../../../_common/button/AppButton.vue';
import { GameModel } from '../../../_common/game/game.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettext } from '../../../_common/translate/translate.service';

type Props = {
	payload: any;
	loginUrl: string;
	accessKey?: string;
};
const { payload, loginUrl, accessKey } = defineProps<Props>();

const emit = defineEmits<{
	claim: [bundle: GameBundleModel];
}>();

const { user } = useCommonStore();

let bundle = ref(new GameBundleModel(payload.bundle));
let games = ref(GameModel.populate(payload.games));

function claim() {
	emit('claim', bundle.value);
}
</script>

<template>
	<div>
		<div v-if="!user" class="alert full-bleed full-bleed-xs text-center">
			<p>
				<a :href="loginUrl">
					{{
						$gettext(
							`Sign in to Game Jolt to be able to claim this bundle into your Library.`
						)
					}}
				</a>
			</p>
		</div>

		<p v-if="user">
			<AppButton primary block @click="claim()">
				{{ $gettext(`Claim Bundle into Library`) }}
			</AppButton>
		</p>

		<h1 class="section-header">{{ bundle.title }}</h1>
		<p>{{ bundle.description }}</p>

		<h3>
			{{ $gettext(`Games in Bundle`) }}
		</h3>

		<div class="row">
			<div v-for="game of games" :key="game.id" class="col-sm-6">
				<AppGameThumbnail
					:game="game"
					:link-to="
						$router.resolve({
							name: 'key',
							params: { accessKey },
							query: { bundleGameId: game.id },
						}).href
					"
					hide-pricing
				/>
			</div>
		</div>
	</div>
</template>
