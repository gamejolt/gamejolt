import Component from 'vue-class-component';
import { Api } from '../../../../../_common/api/api.service';
import { Game } from '../../../../../_common/game/game.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import AppTimelineList from '../../../../../_common/timeline-list/timeline-list.vue';
import { UserGameTrophy } from '../../../../../_common/user/trophy/game-trophy.model';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { TrophyModal } from '../../../../components/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../../components/trophy/thumbnail/thumbnail.vue';
import AppUserLevelWidget from '../../../../components/user/level-widget/level-widget.vue';
import { RouteStore, RouteStoreModule } from '../../profile.store';

type TrophyEntry = {
	gameId?: number;
	game?: Game;
	trophies: UserBaseTrophy[];
};

@Component({
	name: 'RouteProfileTrophiesOverview',
	components: {
		AppUserLevelWidget,
		AppTimelineList,
		AppTimelineListItem,
		AppTimeAgo,
		AppTrophyThumbnail,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/profile/trophies/overview/@' + route.params.username),
})
export default class RouteProfileTrophiesOverview extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	trophyEntries: TrophyEntry[] = [];

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`@%{ user }'s Trophy Case`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get hasTrophies() {
		return this.trophyEntries.length > 0;
	}

	routeResolved($payload: any) {
		let trophies: UserBaseTrophy[] = [];
		if ($payload.trophies) {
			trophies = populateTrophies($payload.trophies);
		}

		// Group the trophies into feed entries:
		// Each entry is a group of trophies of the same origin (same game or site).
		// It also creates a new entry if the difference between achieved trophies is larger than 24 hours.
		for (const userTrophy of trophies) {
			// Set the game/id for this user trophy (undefined for site trophies)
			let game: Game | undefined = undefined;
			let gameId: number | undefined = undefined;
			if (userTrophy instanceof UserGameTrophy) {
				game = userTrophy.game;
				gameId = userTrophy.game_id;
			}
			// Find the previous entry for that game
			let entry = this.trophyEntries
				.slice()
				.reverse()
				.find(i => i.gameId === gameId);
			// If we have a previous entry, either append the trophy,
			// or if the entry was too long ago (more than 24 hours), unset the entry to create a new one afterwards.
			if (entry) {
				const lastTrophy = entry.trophies[entry.trophies.length - 1];
				if (Math.abs(lastTrophy.logged_on - userTrophy.logged_on) > 24 * 60 * 60 * 1000) {
					entry = undefined;
				} else {
					entry.trophies.push(userTrophy);
				}
			}
			// Create a new entry if none exist for this game/trophy
			if (!entry) {
				entry = { game, gameId, trophies: [userTrophy] };
				this.trophyEntries.push(entry);
			}
		}
	}

	onClickTrophy(userTrophy: UserBaseTrophy) {
		TrophyModal.show(userTrophy);
	}
}
