import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post';

export class ViewCtrl
{
	post: Fireside_Post = null;
	likes: any[] = [];
	likesCount = 0;
	userLike: any = null;

	static $inject = [ '$scope', 'App', 'Fireside_Post', 'Fireside_Post_Like', 'payload' ];

	constructor( $scope, App, _Fireside_Post: typeof Fireside_Post, Fireside_Post_Like, payload )
	{
		// Meta.description = 'View all the latest devlog posts for ' + $scope.gameCtrl.game.title + ' on Game Jolt';

		this.post = new _Fireside_Post( payload.post );
		this.likes = Fireside_Post_Like.populate( payload.likes );
		this.likesCount = payload.likesCount;
		this.userLike = payload.userLike ? new Fireside_Post_Like( payload.userLike ) : null;

		$scope.App.title = this.post.title;
	}
}
