import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import AppListGroupSelector from '../../../../../_common/list-group/selector/selector.vue';
import { RouteStore, RouteStoreModule } from '../../profile.store';

export type TrophyNavGame = {
	id: number;
	trophyCount: number;
	title: string;
};

@Component({
	components: {
		AppListGroupSelector,
	},
	filters: {
		number,
	},
})
export default class AppProfileTrophiesNav extends Vue {
	@Prop(Array)
	games!: TrophyNavGame[];

	@Prop(Number)
	siteTrophyCount!: number;

	@Prop(Array)
	unviewedGames!: number[];

	@RouteStoreModule.State
	trophyCount!: RouteStore['trophyCount'];

	get hasGames() {
		return this.games.length > 0;
	}

	get currentGame() {
		const id = parseInt(this.$route.params.id, 10);
		return this.games.find(i => i.id === id);
	}

	gameHasUnviewedTrophies(gameId: number) {
		return this.unviewedGames.includes(gameId);
	}

	changeGame(game: TrophyNavGame) {
		this.$router.push({ name: 'profile.trophies.game', params: { id: game.id + '' } });
	}
}
