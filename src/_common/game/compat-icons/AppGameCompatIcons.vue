<script lang="ts" setup>
import { computed } from 'vue';

import { GameModel } from '~common/game/game.model';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';

type Props = {
	game: GameModel;
};
const { game } = defineProps<Props>();

const compatMapping: Record<string, Jolticon> = {
	os_windows: 'windows',
	os_mac: 'mac',
	os_linux: 'linux',
	os_other: 'other-os',

	type_html: 'html5',
	type_flash: 'flash',
	type_unity: 'unity',
	type_applet: 'java',
	type_silverlight: 'silverlight',

	type_rom: 'rom',
};

const compatFields = Object.keys(compatMapping);

const icons = computed(() => {
	const icons: Jolticon[] = [];

	if (!game.compatibility) {
		return icons;
	}

	for (const field of compatFields) {
		if (game.compatibility[field]) {
			icons.push(compatMapping[field]);
		}
	}

	return icons;
});
</script>

<template>
	<span v-if="icons.length">
		<!-- Bump it down to match up with the bottom of the text more. -->
		<AppJolticon
			v-for="platform of icons"
			:key="platform"
			class="-icon text-bg-subtle relative top-[1px]"
			:icon="platform"
		/>
	</span>
</template>
