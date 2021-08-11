import { defineAsyncComponent } from '@vue/runtime-core';
import { Options, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Environment } from '../_common/environment/environment.service';
import { GameBuild } from '../_common/game/build/build.model';
import { Game } from '../_common/game/game.model';
import { GamePackage } from '../_common/game/package/package.model';
import AppCommonShell from '../_common/shell/shell.vue';
import { Store } from './store/index';

@Options({
	components: {
		AppCommonShell,
		AppEmbedHtml: defineAsyncComponent(
			() =>
				import(/* webpackChunkName: "gameserverHtml" */ './components/embed/html/html.vue')
		),
		AppEmbedFlash: defineAsyncComponent(
			() =>
				import(
					/* webpackChunkName: "gameserverFlash" */ './components/embed/flash/flash.vue'
				)
		),
		AppEmbedUnity: defineAsyncComponent(
			() =>
				import(
					/* webpackChunkName: "gameserverUnity" */ './components/embed/unity/unity.vue'
				)
		),
		AppEmbedApplet: defineAsyncComponent(
			() =>
				import(
					/* webpackChunkName: "gameserverApplet" */ './components/embed/applet/applet.vue'
				)
		),
		AppEmbedRom: defineAsyncComponent(
			() => import(/* webpackChunkName: "gameserverRom" */ './components/embed/rom/rom.vue')
		),
		AppEmbedSilverlight: defineAsyncComponent(
			() =>
				import(
					/* webpackChunkName: "gameserverSilverlight" */ './components/embed/silverlight/silverlight.vue'
				)
		),
	},
})
export default class App extends Vue {
	// Not translatable just yet.
	// mounted() {
	// 	loadCurrentLanguage(this);
	// }

	@State game!: Game;
	@State package!: GamePackage;
	@State build!: GameBuild;
	@State embedWidthStyle!: Store['embedWidthStyle'];
	@State embedHeightStyle!: Store['embedHeightStyle'];

	@Action bootstrap!: Store['bootstrap'];

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
