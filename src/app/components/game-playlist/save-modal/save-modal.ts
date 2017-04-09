import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./save-modal.html';

import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppModal } from '../../../../lib/gj-lib-client/components/modal/modal';
import { FormPlaylist } from '../../forms/playlist/playlist';
import { GameCollection } from '../../game/collection/collection.model';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';

@View
@Component({
	components: {
		AppModal,
		AppJolticon,
		FormPlaylist,
	},
})
export class AppGamePlaylistSaveModal extends Vue
{
	@Prop( Modal ) modal: Modal;
	@Prop( GameCollection ) collection?: GameCollection;

	onSaved( _formModel: GamePlaylist, response: any )
	{
		if ( this.collection ) {
			this.collection.assign( response.gameCollection );
			this.$emit( 'resolve', this.collection );
		}
		else {
			this.$emit( 'resolve', new GameCollection( response.gameCollection ) );
		}
	}
}
