angular.module( 'App.Game.Collection.Thumbnail' ).directive( 'gjGameCollectionThumbnail', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/game/collection/thumbnail/thumbnail.html',
		scope: {
			collection: '=gjGameCollection',
			hideTag: '=?gameCollectionHideTag',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
