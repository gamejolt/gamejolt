import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./nav.html';

import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../../../lib/gj-lib-client/components/popover/popover';
import { AppState } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
	},
	filters: {
		number,
	},
})
export class AppDiscoverGamesViewNav extends Vue
{
	@Prop( Game ) game: Game;
	@Prop( Number ) postsCount: number;
	@Prop( Number ) commentsCount: number;

	@State app: AppState;

	Environment = Environment;

	report()
	{
		this.$emit( 'report' );
	}
}
