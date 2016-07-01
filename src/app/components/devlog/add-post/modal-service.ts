import { Injectable, Inject } from 'ng-metadata/core';
import template from './modal.html';

@Injectable()
export class DevlogAddPostModal
{
	constructor(
		@Inject( '$modal' ) private $modal: any,
		@Inject( 'Api' ) private api: any
	)
	{
	}

	show( game: any, type: string )
	{
		const modalInstance = this.$modal.open( {
			template,
			controller: 'Devlog.AddPost.ModalCtrl',
			controllerAs: '$ctrl',
			// size: 'sm',
			resolve: {
				type: () => type,
				game: () => game,
				response: () => this.api.sendRequest( `/web/dash/developer/games/devlog/new-post/${game.id}/${type}` ),
			},
		} );

		return modalInstance.result;
	}
}
