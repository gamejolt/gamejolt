import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./app.html?style=./app.styl';

import { State, Action } from 'vuex-class';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../lib/gj-lib-client/components/game/build/build.model';
import { Store } from './store/index';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';

@View
@Component({
	components: {
		AppTheme,
		AppEmbedHtml: async () =>
			(await import(/* webpackChunkName: "gameserverHtml" */ './components/embed/html/html'))
				.AppEmbedHtml,
		AppEmbedFlash: async () =>
			(await import(/* webpackChunkName: "gameserverFlash" */ './components/embed/flash/flash'))
				.AppEmbedFlash,
		AppEmbedUnity: async () =>
			(await import(/* webpackChunkName: "gameserverUnity" */ './components/embed/unity/unity'))
				.AppEmbedUnity,
		AppEmbedApplet: async () =>
			(await import(/* webpackChunkName: "gameserverApplet" */ './components/embed/applet/applet'))
				.AppEmbedApplet,
		AppEmbedRom: async () =>
			(await import(/* webpackChunkName: "gameserverRom" */ './components/embed/rom/rom'))
				.AppEmbedRom,
		AppEmbedSilverlight: async () =>
			(await import(/* webpackChunkName: "gameserverSilverlight" */ './components/embed/silverlight/silverlight'))
				.AppEmbedSilverlight,
	},
})
export class App extends Vue {
	// Not translatable just yet.
	// mounted() {
	// 	loadCurrentLanguage(this);
	// }

	@State game: Game;
	@State package: GamePackage;
	@State build: GameBuild;

	@Action bootstrap: Store['bootstrap'];

	GameBuild = GameBuild;

	async created() {
		// We need to tell the browser to attempt to upgrade any insecure
		// requests on the page. This allows game api calls in HTML games to get
		// upgraded to https.
		if (Environment.isSecure) {
			const meta = window.document.createElement('meta');
			meta.httpEquiv = 'Content-Security-Policy';
			meta.content = 'upgrade-insecure-requests';
			window.document.head.appendChild(meta);
		}

		this.bootstrap();
	}
}
