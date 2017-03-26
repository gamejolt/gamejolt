import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./maturity-block.html?style=./maturity-block.styl';
import './maturity-block-content';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Settings } from '../../settings/settings.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { State } from 'vuex-class';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppGameOgrs } from '../ogrs/ogrs';

@View
@Component({
	name: 'game-maturity-block',
	components: {
		AppGameOgrs,
	},
})
export class AppGameMaturityBlock extends Vue
{
	@Prop( Game ) game: Game;

	@State app: AppState;

	isLoaded = false;
	isBlocking: boolean = Settings.get( 'restricted-browsing' );

	created()
	{
		if ( Environment.isPrerender || GJ_IS_SSR ) {
			this.isLoaded = true;
			this.isBlocking = false;
		}
	}

	@Watch( 'game.tigrs_age', { immediate: true } )
	onWatch( val: number )
	{
		if ( typeof val === 'undefined' ) {
			return;
		}

		this.isLoaded = true;

		// If it's the dev of the game, just show immediately.
		if ( this.app.user && this.app.user.id === this.game.developer.id ) {
			this.isBlocking = false;
		}
	}

	proceed()
	{
		this.isBlocking = false;
		Scroll.to( 0, { animate: false } );
		Analytics.trackEvent( 'restricted-browsing', 'unblock' );
	}

	removeRestriction()
	{
		Settings.set( 'restricted-browsing', false );
		this.proceed();
	}
}
