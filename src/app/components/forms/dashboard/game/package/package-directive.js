angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGamePackage', function( $state, Form, App, Api, Game_Package, Sellable )
{
	var form = new Form( {
		model: 'Game_Package',
		template: '/app/components/forms/dashboard/game/package/package.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';
	form.scope.sellable = '=gjSellable';
	form.scope.package = '=gjGamePackage';

	form.onInit = function( scope )
	{
		scope.$state = $state;
		scope.App = App;
		scope.Game_Package = Game_Package;
		scope.formModel.game_id = scope.game.id;

		scope.formState.showDescriptionInput = scope.formModel.description ? true : false;

		if ( !scope.isLoaded ) {
			var params = [ scope.formModel.game_id ];
			if ( scope.method == 'edit' ) {
				params.push( scope.formModel.id );
			}

			Api.sendRequest( '/web/dash/developer/games/packages/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;

				scope.startedPrimary = scope.sellable && scope.sellable.primary;
				scope.hasPrimarySellable = payload.hasPrimarySellable;
				scope.minPrice = payload.minPrice || 50;
				scope.isUserVerified = payload.isUserVerified;

				// If there is no primary sellable yet, let's mark this as the primary sellable.
				// This will only be used if they set the pricing type to something other than free.
				scope.formModel.primary = false;
				if ( !scope.hasPrimarySellable ) {
					scope.formModel.primary = true;
				}

				scope.formModel.pricing_type = 'free';

				if ( scope.method == 'add' ) {
					if ( payload.hasDefaultPackage ) {
						scope.formModel.title = '';
					}
					else {
						scope.formModel.title = scope.game.title;
					}
				}
				else {
					if ( !scope.formModel.title ) {
						scope.formModel.title = scope.game.title;
					}

					scope.formModel.primary = scope.sellable.primary;

					if ( scope.sellable.type != 'free' ) {
						scope.formModel.pricing_type = scope.sellable.type;
						scope.formModel.price = scope.sellable.pricings ? scope.sellable.pricings[0].amount / 100 : 0;

						scope.formState.hasSuggestedPrice = !!scope.formModel.price;
					}
				}
			} );
		}
		else {
			if ( !scope.formModel.title ) {
				scope.formModel.title = scope.game.title;
			}

			// If they saved this form and the package is primary now, we want to set it as
			// having been primary since the beginning.
			if ( scope.formModel.primary ) {
				scope.hasPrimarySellable = true;
				scope.startedPrimary = true;
			}
		}

		scope.$watch( 'formState.hasSuggestedPrice', function( val )
		{
			if ( scope.formModel.pricing_type == 'pwyw' && !val ) {
				scope.formModel.price = null;
			}
		} );
	};

	form.onSubmit = function( scope )
	{
		// We need to do this custom so we can pull the new sellable info.
		return scope.formModel.$save()
			.then( function( response )
			{
				if ( response.success !== false ) {
					if ( scope.baseModel ) {
						scope.baseModel.assign( scope.formModel );
					}

					if ( scope.sellable ) {
						scope.sellable.assign( response.sellable );
					}
				}

				return response;
			} );
	};

	return form;
} );
