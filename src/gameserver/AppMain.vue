<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { Environment } from '../_common/environment/environment.service';
import { GameBuild } from '../_common/game/build/build.model';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useGameserverStore } from './store/index';

const AppEmbedHtml = defineAsyncComponent(() => import('./components/AppEmbedHtml.vue'));
const AppEmbedFlash = defineAsyncComponent(() => import('./components/AppEmbedFlash.vue'));
const AppEmbedUnity = defineAsyncComponent(() => import('./components/AppEmbedUnity.vue'));
const AppEmbedApplet = defineAsyncComponent(() => import('./components/AppEmbedApplet.vue'));
const AppEmbedRom = defineAsyncComponent(() => import('./components/AppEmbedRom.vue'));
const AppEmbedSilverlight = defineAsyncComponent(
	() => import('./components/AppEmbedSilverlight.vue')
);

const { build, embedWidthStyle, embedHeightStyle, bootstrap } = useGameserverStore();

// We need to tell the browser to attempt to upgrade any insecure requests on
// the page. This allows game api calls in HTML games to get upgraded to https.
if (Environment.isSecure) {
	const meta = window.document.createElement('meta');
	meta.httpEquiv = 'Content-Security-Policy';
	meta.content = 'upgrade-insecure-requests';
	window.document.head.appendChild(meta);
}

bootstrap();
</script>

<template>
	<AppCommonShell
		v-if="build"
		class="-build-embed fill-darker -shell-padding"
		:style="{
			width: embedWidthStyle,
			height: embedHeightStyle,
		}"
	>
		<AppEmbedFlash v-if="build.type === GameBuild.TYPE_FLASH" />
		<AppEmbedHtml v-if="build.type === GameBuild.TYPE_HTML" />
		<AppEmbedUnity v-if="build.type === GameBuild.TYPE_UNITY" />
		<AppEmbedSilverlight v-if="build.type === GameBuild.TYPE_SILVERLIGHT" />
		<AppEmbedApplet v-if="build.type === GameBuild.TYPE_APPLET" />
		<AppEmbedRom v-if="build.type === GameBuild.TYPE_ROM" />
	</AppCommonShell>
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
