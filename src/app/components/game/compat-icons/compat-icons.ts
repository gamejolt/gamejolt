import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';

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

@Component({})
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
