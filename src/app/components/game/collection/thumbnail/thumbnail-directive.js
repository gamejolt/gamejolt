angular.module( 'App.Game.Collection.Thumbnail' ).directive( 'gjGameCollectionThumbnail', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./thumbnail.html' ),
		scope: {
			collection: '=gjGameCollection',
			hideTag: '=?gameCollectionHideTag',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
