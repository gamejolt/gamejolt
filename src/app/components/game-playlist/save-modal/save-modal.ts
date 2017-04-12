import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./save-modal.html';

import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormPlaylist } from '../../forms/playlist/playlist';
import { GameCollection } from '../../game/collection/collection.model';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';

@View
@Component({
	components: {
		AppJolticon,
		FormPlaylist,
	},
})
export default class AppGamePlaylistSaveModal extends BaseModal
{
	@Prop( GameCollection ) collection?: GameCollection;

	onSaved( _formModel: GamePlaylist, response: any )
	{
		if ( this.collection ) {
			this.collection.assign( response.gameCollection );
			this.modal.resolve( this.collection );
		}
		else {
			this.modal.resolve( new GameCollection( response.gameCollection ) );
		}
	}
}
