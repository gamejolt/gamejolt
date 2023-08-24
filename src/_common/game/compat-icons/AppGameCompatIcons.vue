<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { styleChangeBg } from '../../../_styles/mixins';
import AppJolticon, { Jolticon } from '../../jolticon/AppJolticon.vue';
import { GameModel } from '../game.model';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
});

const { game } = toRefs(props);

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

	if (!game.value.compatibility) {
		return icons;
	}

	for (const field of compatFields) {
		if (game.value.compatibility[field]) {
			icons.push(compatMapping[field]);
		}
	}

	return icons;
});
</script>

<template>
	<span v-if="icons.length">
		<AppJolticon
			v-for="platform of icons"
			:key="platform"
			class="-icon"
			:icon="platform"
			:style="[
				styleChangeBg('bg-subtle'),
				{
					position: `relative`,
					// Bump it down to match up with the bottom of the text more.
					top: `1px`,
				},
			]"
		/>
	</span>
</template>
