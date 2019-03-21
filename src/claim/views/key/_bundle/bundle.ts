import { GameBundle } from 'game-jolt-frontend-lib/components/game-bundle/game-bundle.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppJolticon,
		AppGameThumbnail,
	},
})
export default class AppKeyBundle extends Vue {
	@Prop()
	payload!: any;

	@Prop()
	loginUrl!: string;

	@Prop()
	accessKey?: string;

	@State
	app!: Store['app'];

	bundle: GameBundle = null as any;
	games: Game[] = [];

	created() {
		this.bundle = new GameBundle(this.payload.bundle);
		this.games = Game.populate(this.payload.games);
	}

	claim() {
		this.$emit('claim', this.bundle);
	}
}
