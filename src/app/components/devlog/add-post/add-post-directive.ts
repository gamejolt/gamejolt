import { Component, Inject, Input } from 'ng-metadata/core';
import { DevlogAddPostModal } from './modal-service';
import template from './add-post.html';

@Component({
	selector: 'gj-devlog-add-post',
	template,
})
export class AddPostComponent
{
	@Input( '<' ) game: any;

	constructor(
		@Inject( 'DevlogAddPostModal' ) private modal: DevlogAddPostModal
	)
	{
	}

	showAddModal( type: string )
	{
		this.modal.show( this.game, type );
	}
}
