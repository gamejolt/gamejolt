import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./trophies.html';

import { BeforeRouteEnter } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.state';
import { GameTrophy } from '../../../../../../../lib/gj-lib-client/components/game/trophy/trophy.model';
import { AppCardList } from '../../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListDraggable } from '../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppCardListItem } from '../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppTrophyThumbnail } from '../../../../../../components/trophy/thumbnail/thumbnail';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { FormGameTrophy } from '../../../../../../components/forms/game/trophy/trophy';

@View
@Component({
	components: {
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppTrophyThumbnail,
		AppJolticon,
		FormGameTrophy,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManageApiTrophies extends Vue {
	@RouteState game: RouteStore['game'];

	trophies: GameTrophy[] = [];
	isAdding = {
		[GameTrophy.DIFFICULTY_BRONZE]: false,
		[GameTrophy.DIFFICULTY_SILVER]: false,
		[GameTrophy.DIFFICULTY_GOLD]: false,
		[GameTrophy.DIFFICULTY_PLATINUM]: false,
	};
	activeItem = {
		[GameTrophy.DIFFICULTY_BRONZE]: null,
		[GameTrophy.DIFFICULTY_SILVER]: null,
		[GameTrophy.DIFFICULTY_GOLD]: null,
		[GameTrophy.DIFFICULTY_PLATINUM]: null,
	};

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
			[GameTrophy.DIFFICULTY_BRONZE]: this.getTrophyGroup(
				GameTrophy.DIFFICULTY_BRONZE,
			),
			[GameTrophy.DIFFICULTY_SILVER]: this.getTrophyGroup(
				GameTrophy.DIFFICULTY_SILVER,
			),
			[GameTrophy.DIFFICULTY_GOLD]: this.getTrophyGroup(
				GameTrophy.DIFFICULTY_GOLD,
			),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.getTrophyGroup(
				GameTrophy.DIFFICULTY_PLATINUM,
			),
		};
	}

	get hasHiddenTrophies() {
		return this.trophies.filter(item => !item.visible).length > 0;
	}

	@BeforeRouteEnter()
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/trophies/' + route.params.id,
		);
	}

	routed() {
		Meta.title = this.$gettextInterpolate('Manage Trophies for %{ game }', {
			game: this.game.title,
		});

		this.trophies = GameTrophy.populate(this.$payload.trophies);
	}

	private getTrophyGroup(difficulty: number) {
		return this.groupedTrophies[difficulty].map(item => item.id);
	}

	// 	function canDrop( sourceScope, destScope, destIndex )
	// 	{
	// 		// Difficulty is pull into the scopes by the ng-repeat on the page.
	// 		// We check to see if the difficulties are the same.
	// 		// We don't currently allow dragging/dropping between difficulty levels just yet.
	// 		if ( sourceScope.difficulty === destScope.difficulty ) {
	// 			return true;
	// 		}

	// 		return false;
	// 	}

	// 	function onTrophyAdded( trophy )
	// 	{
	// 		// Close all "add" forms.
	// 		this.isAdding = {};

	// 		this.trophies.push( trophy );
	// 		refreshTrophies();

	// 		// We want to scroll to the top of the item's position when saving since the form is pretty long.
	// 		// The position may change if they changed the difficulty level, so we let angular compile first.
	// 		$timeout( function()
	// 		{
	// 			Scroll.to( 'trophy-container-' + trophy.id );
	// 		} );
	// 	}

	// 	function onTrophyEdited( trophy )
	// 	{
	// 		// Close all "edit" forms.
	// 		_this.activeItem = {};

	// 		// May have switched difficulty level, so we gotta fully refresh.
	// 		refreshTrophies();

	// 		// We want to scroll to the top of the item's position when saving since the form is pretty long.
	// 		// The position may change if they changed the difficulty level, so we let angular compile first.
	// 		$timeout( function()
	// 		{
	// 			Scroll.to( 'trophy-container-' + trophy.id );
	// 		} );
	// 	}

	// TODO
	saveTrophySort() {}

	// 	function onTrophySorted( event )
	// 	{
	// 		var difficulty = event.source.nodeScope.trophy.difficulty;
	// 		var newSort = _.pluck( _this.groupedTrophies[ difficulty ], 'id' );

	// 		// Make sure that the sorting has changed.
	// 		if ( !angular.equals( newSort, _this.trophySorts[ difficulty ] ) ) {

	// 			// Save off the sort.
	// 			_this.trophySorts[ difficulty ] = newSort;
	// 			Game_Trophy.$saveSort( $scope.manageCtrl.game.id, difficulty, newSort );
	// 		}
	// 	}

	// 	function removeTrophy( trophy )
	// 	{
	// 		ModalConfirm.show( gettextCatalog.getString( 'dash.games.trophies.remove_confirmation' ) )
	// 			.then( function()
	// 			{
	// 				return trophy.$remove();
	// 			} )
	// 			.then( function()
	// 			{
	// 				_.remove( _this.trophies, { id: trophy.id } );
	// 				refreshTrophies();
	// 			} );
	// 	}
}
