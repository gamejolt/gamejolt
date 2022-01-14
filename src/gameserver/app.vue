<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core';
import { Options, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Environment } from '../_common/environment/environment.service';
import { GameBuild } from '../_common/game/build/build.model';
import { Game } from '../_common/game/game.model';
import { GamePackage } from '../_common/game/package/package.model';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { Store } from './store/index';

@Options({
	components: {
		AppCommonShell,
		AppEmbedHtml: defineAsyncComponent(() => import('./components/embed/html/html.vue')),
		AppEmbedFlash: defineAsyncComponent(() => import('./components/embed/flash/flash.vue')),
		AppEmbedUnity: defineAsyncComponent(() => import('./components/embed/unity/unity.vue')),
		AppEmbedApplet: defineAsyncComponent(() => import('./components/embed/applet/applet.vue')),
		AppEmbedRom: defineAsyncComponent(() => import('./components/embed/rom/rom.vue')),
		AppEmbedSilverlight: defineAsyncComponent(
			() => import('./components/embed/silverlight/silverlight.vue')
		),
	},
})
export default class App extends Vue {
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
</script>

<template>
	<app-common-shell
		v-if="build"
		class="-build-embed fill-darker -shell-padding"
		:style="{
			width: embedWidthStyle,
			height: embedHeightStyle,
		}"
	>
		<app-embed-flash v-if="build.type === GameBuild.TYPE_FLASH" />
		<app-embed-html v-if="build.type === GameBuild.TYPE_HTML" />
		<app-embed-unity v-if="build.type === GameBuild.TYPE_UNITY" />
		<app-embed-silverlight v-if="build.type === GameBuild.TYPE_SILVERLIGHT" />
		<app-embed-applet v-if="build.type === GameBuild.TYPE_APPLET" />
		<app-embed-rom v-if="build.type === GameBuild.TYPE_ROM" />
	</app-common-shell>
</template>

<style lang="stylus" scoped>
.-build-embed
	margin: 0
	padding: 0
	display: flex

	// This fixes issues where they don't set a body bg color.
	// https://github.com/gamejolt/next-issue-tracker/issues/241
	> iframe
		margin: 0
		padding: 0
		background-color: $white
		border: 0
</style>
