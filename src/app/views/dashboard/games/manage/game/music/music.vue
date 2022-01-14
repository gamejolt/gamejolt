<script lang="ts">
import { Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../../utils/array';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import { GameSong } from '../../../../../../../_common/game/song/song.model';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import FormGameSong from '../../../../../../components/forms/game/song/song.vue';
import AppDashGameWizardControls from '../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

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
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/music/' + route.params.id),
})
export default class RouteDashGamesManageGameMusic extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	songs: GameSong[] = [];
	isAdding = false;
	isProcessing = false;
	activeItem: GameSong | null = null;

	get currentSort() {
		return this.songs.map(item => item.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Manage Music for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.songs = GameSong.populate($payload.songs);
		this.isAdding = !this.songs.length;
	}

	onSongEdited() {
		this.activeItem = null;
	}

	onSongAdded(formModel: GameSong) {
		this.songs.push(new GameSong(formModel));
		this.isAdding = false;
	}

	saveSongSort(songs: GameSong[]) {
		this.songs = songs;
		GameSong.$saveSort(this.game.id, this.currentSort);
	}

	async removeSong(song: GameSong) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.music.remove_confirmation')
		);

		if (!result) {
			return;
		}

		this.isProcessing = true;
		await song.$remove();
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
					<translate>
						Let people enjoy your game's soundtrack whenever they want! Upload MP3s of
						music from your game and the songs will appear on your game page in a nice
						little music player. Don't upload copyrighted songs without permission!
					</translate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="!songs.length" class="alert">
				<p>
					<translate>
						You haven't added any music. Upload some songs from your game! The music
						player's worth it, trust us!
					</translate>
				</p>
			</div>

			<app-loading-fade :is-loading="isProcessing">
				<app-card-list
					:items="songs"
					:active-item="activeItem"
					:is-adding="isAdding"
					is-draggable
					@activate="activeItem = $event"
				>
					<app-card-list-draggable item-key="id" @change="saveSongSort">
						<template #item="{ element: song }">
							<app-card-list-item :item="song">
								<a class="card-remove" @click.stop="removeSong(song)">
									<app-jolticon icon="remove" />
								</a>

								<div class="card-title">
									<h5>{{ song.title }}</h5>
								</div>

								<template #body>
									<form-game-song
										:game="game"
										:model="song"
										@submit="onSongEdited"
									/>
								</template>
							</app-card-list-item>
						</template>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext('dash.games.music.add_button')"
						@toggle="isAdding = !isAdding"
					>
						<form-game-song :game="game" @submit="onSongAdded" />
					</app-card-list-add>
				</app-card-list>
			</app-loading-fade>

			<app-dash-game-wizard-controls />
		</div>
	</div>
</template>
