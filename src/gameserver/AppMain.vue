<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

import { Environment } from '~common/environment/environment.service';
import {
	GameBuildTypeApplet,
	GameBuildTypeFlash,
	GameBuildTypeHtml,
	GameBuildTypeRom,
	GameBuildTypeSilverlight,
	GameBuildTypeUnity,
} from '~common/game/build/build.model';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { useGameserverStore } from '~gameserver/store/index';

const AppEmbedHtml = defineAsyncComponent(() => import('~gameserver/components/AppEmbedHtml.vue'));
const AppEmbedFlash = defineAsyncComponent(
	() => import('~gameserver/components/AppEmbedFlash.vue')
);
const AppEmbedUnity = defineAsyncComponent(
	() => import('~gameserver/components/AppEmbedUnity.vue')
);
const AppEmbedApplet = defineAsyncComponent(
	() => import('~gameserver/components/AppEmbedApplet.vue')
);
const AppEmbedRom = defineAsyncComponent(() => import('~gameserver/components/AppEmbedRom.vue'));
const AppEmbedSilverlight = defineAsyncComponent(
	() => import('~gameserver/components/AppEmbedSilverlight.vue')
);

const { build, bootstrap } = useGameserverStore();

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
	<AppCommonShell v-if="build">
		<div class="-build-embed fill-darker">
			<AppEmbedFlash v-if="build.type === GameBuildTypeFlash" />
			<AppEmbedHtml v-if="build.type === GameBuildTypeHtml" />
			<AppEmbedUnity v-if="build.type === GameBuildTypeUnity" />
			<AppEmbedSilverlight v-if="build.type === GameBuildTypeSilverlight" />
			<AppEmbedApplet v-if="build.type === GameBuildTypeApplet" />
			<AppEmbedRom v-if="build.type === GameBuildTypeRom" />
		</div>
	</AppCommonShell>
</template>

<style lang="stylus" scoped>
.-build-embed
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center
	overflow: auto

	// This fixes issues where they don't set a body bg color.
	// https://github.com/gamejolt/next-issue-tracker/issues/241
	> iframe
		margin: 0
		padding: 0
		background-color: $white
		border: 0
</style>
