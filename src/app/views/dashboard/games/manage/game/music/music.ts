import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCardListAdd from 'game-jolt-frontend-lib/components/card/list/add/add.vue';
import AppCardListDraggable from 'game-jolt-frontend-lib/components/card/list/draggable/draggable.vue';
import AppCardListItem from 'game-jolt-frontend-lib/components/card/list/item/item.vue';
import AppCardList from 'game-jolt-frontend-lib/components/card/list/list.vue';
import { GameSong } from 'game-jolt-frontend-lib/components/game/song/song.model';
import AppLoadingFade from 'game-jolt-frontend-lib/components/loading/fade/fade.vue';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import FormGameSong from '../../../../../../components/forms/game/song/song.vue';
import AppDashGameWizardControls from '../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameMusic',
	components: {
		FormGameSong,
		AppCardList,
		AppCardListItem,
		AppCardListDraggable,
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
		const result = await ModalConfirm.show(this.$gettext('dash.games.music.remove_confirmation'));

		if (!result) {
			return;
		}

		this.isProcessing = true;
		await song.$remove();
		arrayRemove(this.songs, i => i.id === song.id);
		this.isProcessing = false;
	}
}
