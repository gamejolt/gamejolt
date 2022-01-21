<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../game.model';

const compatMapping: any = {
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

@Options({})
export default class AppGameCompatIcons extends Vue {
	@Prop(Object) game!: Game;

	platforms: string[] = [];

	mounted() {
		if (!this.game.compatibility) {
			return;
		}

		for (const field of compatFields) {
			if (this.game.compatibility[field]) {
				this.platforms.push(compatMapping[field]);
			}
		}
	}
}
</script>

<template>
	<span v-if="platforms.length" class="game-compat-icons">
		<app-jolticon
			v-for="platform of platforms"
			:key="platform"
			class="-icon"
			:icon="platform"
		/>
	</span>
</template>

<style lang="stylus" scoped>
.-icon
	theme-prop('color', 'bg-subtle')
	position: relative
	top: 1px // Bump it down to match up with the bottom of the text more.
</style>
