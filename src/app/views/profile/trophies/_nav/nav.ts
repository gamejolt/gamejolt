import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import { RouteStore, RouteStoreModule } from '../../profile.store';

export type TrophyNavGame = {
	id: number;
	trophyCount: number;
	title: string;
};

@Component({
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

	gameHasUnviewedTrophies(gameId: number) {
		return this.unviewedGames.includes(gameId);
	}
}
