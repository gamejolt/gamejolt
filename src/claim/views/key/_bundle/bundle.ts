import View from '!view!./bundle.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppGameThumbnail } from '../../../../_common/game/thumbnail/thumbnail';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppGameThumbnail,
	},
})
export class AppKeyBundle extends Vue {
	@Prop() payload: any;
	@Prop() loginUrl: string;
	@Prop() accessKey?: string;

	@State app: Store['app'];

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
