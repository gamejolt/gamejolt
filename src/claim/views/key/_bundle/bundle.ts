import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./bundle.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { Store } from '../../../store/index';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameThumbnail } from '../../../../app/components/game/thumbnail/thumbnail';

@View
@Component({
	components: {
		AppJolticon,
		AppGameThumbnail,
	},
})
export class AppKeyBundle extends Vue
{
	@Prop() payload: any;
	@Prop() loginUrl: string;
	@Prop() accessKey?: string;

	@State app: Store['app'];

	bundle: GameBundle = null as any;
	games: Game[] = [];

	created()
	{
		this.bundle = new GameBundle( this.payload.bundle );
		this.games = Game.populate( this.payload.games );

		Meta.title = this.$gettextInterpolate(
			`Key Page for %{ bundle }`,
			{ bundle: this.bundle.title },
		);
	}

	claim()
	{
		this.$emit( 'claim', this.bundle );
	}
}
