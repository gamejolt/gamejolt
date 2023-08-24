<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import AppButton from '../../../_common/button/AppButton.vue';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { GameModel } from '../../../_common/game/game.model';
import AppGameThumbnail from '../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettext } from '../../../_common/translate/translate.service';

const props = defineProps({
	payload: {
		type: Object,
		required: true,
	},
	loginUrl: {
		type: String,
		required: true,
	},
	accessKey: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	claim: (_bundle: GameBundleModel) => true,
});

const { payload } = toRefs(props);
const { user } = useCommonStore();

let bundle = ref(new GameBundleModel(payload.value.bundle));
let games = ref(GameModel.populate(payload.value.games));

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
