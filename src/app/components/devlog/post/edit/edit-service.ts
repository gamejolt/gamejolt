import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./edit.html';

@Injectable()
export class DevlogPostEdit
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( post: Fireside_Post ): ng.IPromise<Fireside_Post>
	{
		const modalInstance = this.$modal.open( {
			keyboard: false,
			backdrop: 'static',
			template,
			controller: 'Devlog.Post.EditModalCtrl',
			controllerAs: '$ctrl',
			resolve: {
				// They may load this on the game page without having dash stuff loaded in yet.
				init: [ '$ocLazyLoad', ( $ocLazyLoad: oc.ILazyLoad ) => $ocLazyLoad.load( '/app/modules/dash.js' ) ],
				post: () => post,
			},
		} );

		return modalInstance.result;
	}
}
