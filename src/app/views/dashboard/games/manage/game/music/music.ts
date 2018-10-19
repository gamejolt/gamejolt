import View from '!view!./music.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCardListAdd } from '../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { AppCardListDraggable } from '../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { GameSong } from '../../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { AppLoadingFade } from '../../../../../../../lib/gj-lib-client/components/loading/fade/fade';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { arrayRemove } from '../../../../../../../lib/gj-lib-client/utils/array';
import { FormGameSong } from '../../../../../../components/forms/game/song/song';
import { AppDashGameWizardControls } from '../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
