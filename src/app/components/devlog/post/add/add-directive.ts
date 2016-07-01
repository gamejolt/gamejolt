import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { DevlogPostEdit } from '../edit/edit-service';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from './add.html';

@Component({
	selector: 'gj-devlog-post-add',
	template,
})
export class AddComponent
{
	@Input( '<' ) game: any;
	@Output() onAdded: Function;

	constructor(
		@Inject( 'DevlogPostEdit' ) private editModal: DevlogPostEdit,
		@Inject( 'Api' ) private api: any
	)
	{
	}

	showAddModal( type: string )
	{
		this.api.sendRequest( `/web/dash/developer/games/devlog/new-post/${this.game.id}/${type}` )
			.then( response =>
			{
				return new Fireside_Post( response.post );
			} )
			.then( ( post: Fireside_Post ) =>
			{
				return this.editModal.show( post );
			} )
			.then( ( post: Fireside_Post ) =>
			{
				if ( this.onAdded ) {
					this.onAdded( { $post: post } );
				}
			} );
	}
}
