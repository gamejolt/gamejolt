import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCardListAdd from 'game-jolt-frontend-lib/components/card/list/add/add.vue';
import AppCardListDraggable from 'game-jolt-frontend-lib/components/card/list/draggable/draggable.vue';
import AppCardListItem from 'game-jolt-frontend-lib/components/card/list/item/item.vue';
import AppCardList from 'game-jolt-frontend-lib/components/card/list/list.vue';
import { GameTrophy, GameTrophyDifficulty } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Component } from 'vue-property-decorator';
import FormGameTrophy from '../../../../../../components/forms/game/trophy/trophy.vue';
import AppTrophyThumbnail from '../../../../../../components/trophy/thumbnail/thumbnail.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageApiTrophies',
	components: {
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppCardListAdd,
		AppTrophyThumbnail,
		FormGameTrophy,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/trophies/' + route.params.id),
})
export default class RouteDashGamesManageApiTrophies extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	trophies: GameTrophy[] = [];
	isAdding: { [x: number]: boolean } = {};
	activeItem: { [x: number]: GameTrophy | null } = {};

	GameTrophy = GameTrophy;

	get groupedTrophies() {
		const trophies: { [x: number]: GameTrophy[] } = {
			[GameTrophy.DIFFICULTY_BRONZE]: [],
			[GameTrophy.DIFFICULTY_SILVER]: [],
			[GameTrophy.DIFFICULTY_GOLD]: [],
			[GameTrophy.DIFFICULTY_PLATINUM]: [],
		};

		this.trophies.forEach(item => trophies[item.difficulty].push(item));

		return trophies;
	}

	get trophyLabels() {
		return {
			[GameTrophy.DIFFICULTY_BRONZE]: this.$gettext('trophies.bronze'),
			[GameTrophy.DIFFICULTY_SILVER]: this.$gettext('trophies.silver'),
			[GameTrophy.DIFFICULTY_GOLD]: this.$gettext('trophies.gold'),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.$gettext('trophies.platinum'),
		};
	}

	get trophySorts() {
		return {
			[GameTrophy.DIFFICULTY_BRONZE]: this.getTrophyGroup(GameTrophy.DIFFICULTY_BRONZE),
			[GameTrophy.DIFFICULTY_SILVER]: this.getTrophyGroup(GameTrophy.DIFFICULTY_SILVER),
			[GameTrophy.DIFFICULTY_GOLD]: this.getTrophyGroup(GameTrophy.DIFFICULTY_GOLD),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.getTrophyGroup(GameTrophy.DIFFICULTY_PLATINUM),
		};
	}

	get hasHiddenTrophies() {
		return this.trophies.filter(item => !item.visible).length > 0;
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Trophies for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeCreated() {
		this.resetActive();
		this.resetAdding();
	}

	routeResolved($payload: any) {
		this.trophies = GameTrophy.populate($payload.trophies);
	}

	private getTrophyGroup(difficulty: number) {
		return this.groupedTrophies[difficulty].map(item => item.id);
	}

	async onTrophyAdded(trophy: GameTrophy) {
		// Close all "add" forms.
		this.resetAdding();
		this.trophies.push(trophy);

		// We want to scroll to the top of the item's position when saving
		// since the form is pretty long. The position may change if they
		// changed the difficulty level, so we let it compile first.
		await this.$nextTick();
		Scroll.to('trophy-container-' + trophy.id);
	}

	async onTrophyEdited(trophy: GameTrophy) {
		// Close all "edit" forms.
		this.resetActive();

		// We want to scroll to the top of the item's position when saving since
		// the form is pretty long. The position may change if they changed the
		// difficulty level, so we let angular compile first.
		await this.$nextTick();
		Scroll.to('trophy-container-' + trophy.id);
	}

	saveTrophySort(difficulty: GameTrophyDifficulty, trophies: GameTrophy[]) {
		// Pull out the trophies and then add them back in in the correct order.
		const trophyIds = trophies.map(i => i.id);
		let filtered = this.trophies.filter(i => trophyIds.indexOf(i.id) === -1).concat(trophies);

		// Replace with new sort.
		this.trophies.splice(0, this.trophies.length, ...filtered);

		GameTrophy.$saveSort(this.game.id, difficulty, this.trophySorts[difficulty]);
	}

	async removeTrophy(trophy: GameTrophy) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.trophies.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await trophy.$remove();

		const index = this.trophies.findIndex(item => item.id === trophy.id);
		if (index !== -1) {
			this.trophies.splice(index, 1);
		}
	}

	private resetAdding() {
		this.$set(this, 'isAdding', {
			[GameTrophy.DIFFICULTY_BRONZE]: false,
			[GameTrophy.DIFFICULTY_SILVER]: false,
			[GameTrophy.DIFFICULTY_GOLD]: false,
			[GameTrophy.DIFFICULTY_PLATINUM]: false,
		});
	}

	private resetActive() {
		this.$set(this, 'activeItem', {
			[GameTrophy.DIFFICULTY_BRONZE]: null,
			[GameTrophy.DIFFICULTY_SILVER]: null,
			[GameTrophy.DIFFICULTY_GOLD]: null,
			[GameTrophy.DIFFICULTY_PLATINUM]: null,
		});
	}
}
