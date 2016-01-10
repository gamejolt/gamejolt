angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameThumbnail', function( Form, Api )
{
	var form = new Form( {
		model: 'Game',
		template: '/app/components/forms/dashboard/game/thumbnail/thumbnail.html',
		saveMethod: '$saveThumbnail',
		resetOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/thumbnail/save/' + scope.baseModel.id ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
				form.checkCanCrop( scope );
			} );
		}

		// Only set this once.
		// If the thumbnail changes outside of this form, we want to reinitialize it to pick up the changes.
		if ( !scope.isWatcherSet ) {
			scope.$watch( function()
			{
				return !!scope.baseModel.thumbnail_media_item;
			},
			function( newVal, oldVal )
			{
				if ( newVal !== oldVal ) {
					form._init( scope );
				}
			} );
			scope.isWatcherSet = true;
		}

		if ( scope.formModel.thumbnail_media_item ) {
			scope.formModel.crop = scope.formModel.thumbnail_media_item.getCrop();
			form.checkCanCrop( scope );
		}
		else {
			scope.formModel.crop = undefined;
		}

		scope.formModel.file = undefined;
	};

	/**
	 * Old thumbnails were smaller than our current minimums.
	 * We don't want to allow to crop them, but we do want to allow them to upload a new one.
	 * We check here if it's too small to crop to signal to the form to remove the cropper.
	 */
	form.checkCanCrop = function( scope )
	{
		if ( !scope.baseModel.thumbnail_media_item ) {
			return;
		}

		scope.canCrop = true;
		if ( scope.baseModel.thumbnail_media_item.width < scope.minWidth || scope.baseModel.thumbnail_media_item.height < scope.minHeight ) {
			scope.canCrop = false;
		}
	};

	return form;
} );
