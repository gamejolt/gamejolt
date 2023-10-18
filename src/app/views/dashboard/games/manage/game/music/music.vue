<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
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
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
LegacyRouteComponent,
OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { arrayRemove } from '../../../../../../../utils/array';
import FormGameSong from '../../../../../../components/forms/game/song/song.vue';
import AppDashGameWizardControls from '../../../../../../components/forms/game/wizard-controls/AppDashGameWizardControls.vue';
import { useGameDashRouteController } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameMusic',
	components: {
		FormGameSong,
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		AppDashGameWizardControls,
		AppLoadingFade,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/music/' + route.params.id),
})
export default class RouteDashGamesManageGameMusic extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	songs: GameSongModel[] = [];
	isAdding = false;
	isProcessing = false;
	activeItem: GameSongModel | null = null;

	get currentSort() {
		return this.songs.map(item => item.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettext(`Manage Music for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.songs = GameSongModel.populate($payload.songs);
		this.isAdding = !this.songs.length;
	}

	onSongEdited() {
		this.activeItem = null;
	}

	onSongAdded(formModel: GameSongModel) {
		this.songs.push(new GameSongModel(formModel));
		this.isAdding = false;
	}

	saveSongSort(songs: GameSongModel[]) {
		this.songs = songs;
		$saveGameSongSort(this.game.id, this.currentSort);
	}

	async removeSong(song: GameSongModel) {
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this song?')
		);

		if (!result) {
			return;
		}

		this.isProcessing = true;
		await $removeGameSong(song);
		arrayRemove(this.songs, i => i.id === song.id);
		this.isProcessing = false;
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
		<div class="col-sm-4 col-sm-push-8">
			<div class="page-help">
				<p>
					<AppTranslate>
						Let people enjoy your game's soundtrack whenever they want! Upload MP3s of
						music from your game and the songs will appear on your game page in a nice
						little music player. Don't upload copyrighted songs without permission!
					</AppTranslate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="!songs.length" class="alert">
				<p>
					<AppTranslate>
						You haven't added any music. Upload some songs from your game! The music
						player's worth it, trust us!
					</AppTranslate>
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
