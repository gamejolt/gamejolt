import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post';

export class ViewCtrl
{
	post: Fireside_Post = null;

	static $inject = [ '$scope', 'App', 'Fireside_Post', 'payload' ];

	constructor( $scope, App, _Fireside_Post: typeof Fireside_Post, payload )
	{
		// Meta.description = 'View all the latest devlog posts for ' + $scope.gameCtrl.game.title + ' on Game Jolt';

		this.post = new _Fireside_Post( payload.post );

		$scope.App.title = this.post.title;
	}
}
