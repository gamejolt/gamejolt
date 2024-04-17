<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/AppCardListItem.vue';
import {
	$removeGameSong,
	$saveGameSongSort,
	GameSongModel,
} from '../../../../../../../_common/game/song/song.model';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../../../utils/array';
import FormGameSong from '../../../../../../components/forms/game/song/song.vue';
import AppDashGameWizardControls from '../../../../../../components/forms/game/wizard-controls/AppDashGameWizardControls.vue';
import { useGameDashRouteController } from '../../manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/music/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const songs = ref<GameSongModel[]>([]);
const isAdding = ref(false);
const isProcessing = ref(false);
const activeItem = ref<GameSongModel | undefined>(undefined);

const currentSort = computed(() => songs.value.map(item => item.id));

function onSongEdited() {
	activeItem.value = undefined;
}

function onSongAdded(formModel: GameSongModel) {
	songs.value.push(new GameSongModel(formModel));
	isAdding.value = false;
}

function saveSongSort(newSongs: GameSongModel[]) {
	songs.value = newSongs;
	$saveGameSongSort(game.value!.id, currentSort.value);
}

async function removeSong(song: GameSongModel) {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this song?'));

	if (!result) {
		return;
	}

	isProcessing.value = true;
	await $removeGameSong(song);
	arrayRemove(songs.value, i => i.id === song.id);
	isProcessing.value = false;
}

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext(`Manage Music for %{ game }`, {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		songs.value = GameSongModel.populate(payload.songs);
		isAdding.value = !songs.value.length;
	},
});
</script>

<template>
	<div v-if="isBootstrapped" class="row">
		<div class="col-sm-4 col-sm-push-8">
			<div class="page-help">
				<p>
					{{
						$gettext(
							`Let people enjoy your game's soundtrack whenever they want! Upload MP3s of music from your game and the songs will appear on your game page in a nice little music player. Don't upload copyrighted songs without permission!`
						)
					}}
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="!songs.length" class="alert">
				<p>
					{{
						$gettext(
							`You haven't added any music. Upload some songs from your game! The music player's worth it, trust us!`
						)
					}}
				</p>
			</div>

			<AppLoadingFade :is-loading="isProcessing">
				<AppCardList
					:items="songs"
					:active-item="activeItem"
					:is-adding="isAdding"
					is-draggable
					@activate="activeItem = $event"
				>
					<AppCardListDraggable item-key="id" @change="saveSongSort">
						<template #item="{ element: song }">
							<AppCardListItem :item="song">
								<a class="card-remove" @click.stop="removeSong(song)">
									<AppJolticon icon="remove" />
								</a>

								<div class="card-title">
									<h5>{{ song.title }}</h5>
								</div>

								<template #body>
									<FormGameSong
										:game="game"
										:model="song"
										@submit="onSongEdited"
									/>
								</template>
							</AppCardListItem>
						</template>
					</AppCardListDraggable>

					<AppCardListAdd :label="$gettext('Add Song')" @toggle="isAdding = !isAdding">
						<FormGameSong :game="game" @submit="onSongAdded" />
					</AppCardListAdd>
				</AppCardList>
			</AppLoadingFade>

			<AppDashGameWizardControls />
		</div>
	</div>
</template>
