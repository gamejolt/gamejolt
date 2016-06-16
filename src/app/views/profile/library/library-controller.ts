import { App } from './../../../app-service.ts';

export class LibraryCtrl
{
	collections: any[];
	followedCollection: any;
	developerCollection: any;
	ownedCollection: any;

	constructor(
		$scope,
		App: App,
		GameCollection,
		payload
	)
	{
		App.title = 'Library of ' + $scope.profileCtrl.user.display_name;

		this.collections = GameCollection.populate( payload.collections );

		this.followedCollection = payload.followedCollection ? new GameCollection( payload.followedCollection ) : null;
		this.developerCollection = payload.developerCollection ? new GameCollection( payload.developerCollection ) : null;
		this.ownedCollection = payload.ownedCollection ? new GameCollection( payload.ownedCollection ) : null;

		this.collections.unshift( this.ownedCollection );
		this.collections.unshift( this.followedCollection );

		if ( this.developerCollection ) {
			this.collections.unshift( this.developerCollection );
		}
	}
}
