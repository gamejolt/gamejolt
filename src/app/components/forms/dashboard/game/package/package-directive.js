angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGamePackage', function( Form, Api, Game_Package )
{
	var form = new Form( {
		model: 'Game_Package',
		template: '/app/components/forms/dashboard/game/package/package.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;

		scope.formState.showDescriptionInput = scope.formModel.description ? true : false;
		scope.formState.hasSales = false;

		if ( !scope.isLoaded ) {
			var params = [ scope.formModel.game_id ];
			if ( scope.method == 'edit' ) {
				params.push( scope.formModel.id );
			}

			Api.sendRequest( '/web/dash/developer/games/packages/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;

				scope.startedPrimary = payload.sellable && payload.sellable.primary;
				scope.hasPrimarySellable = payload.hasPrimarySellable;

				scope.formState.hasSales = payload.hasSales;

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

					if ( payload.sellable && payload.sellable.type != 'free' ) {
						scope.formModel.pricing_type = payload.sellable.type;
						scope.formModel.price = payload.sellable.pricings ? payload.sellable.pricings[0].amount / 100 : 0;
						scope.formModel.primary = payload.sellable.primary;

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

	return form;
} );
