import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { AppGamePlaylistSaveModal } from './save-modal';
import { GameCollection } from '../../game/collection/collection.model';

export class GamePlaylistSaveModal
{
	static async show( collection?: GameCollection )
	{
		return await Modal.show( {
			component: AppGamePlaylistSaveModal,
			props: { collection },
			size: 'sm',
		} );
	}
}
