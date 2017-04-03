import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./compat-icons.html?style=./compat-icons.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

const compatMapping: any = {
	'os_windows': 'windows',
	'os_mac': 'mac',
	'os_linux': 'linux',
	'os_other': 'other-os',

	'type_html': 'html5',
	'type_flash': 'flash',
	'type_unity': 'unity',
	'type_applet': 'java',
	'type_silverlight': 'silverlight',

	'type_rom': 'rom',
};

const compatFields = Object.keys( compatMapping );

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameCompatIcons extends Vue
{
	@Prop( Object ) game: Game;

	platforms: string[] = [];

	mounted()
	{
		if ( !this.game.compatibility ) {
			return;
		}

		for ( const field of compatFields ) {
			if ( this.game.compatibility[ field ] ) {
				this.platforms.push( compatMapping[ field ] );
			}
		}
	}
}
