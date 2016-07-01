import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class ModalCtrl
{
	post: Fireside_Post;

	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'type' ) private type: string,
		@Inject( 'game' ) private game: any,
		@Inject( 'response' ) response: any
	)
	{
		this.post = new Fireside_Post( response.post );
	}

	onSubmitted( post: Fireside_Post )
	{
		this.$modalInstance.close( post );
	}

	close()
	{
		this.$modalInstance.dismiss();
	}
}
