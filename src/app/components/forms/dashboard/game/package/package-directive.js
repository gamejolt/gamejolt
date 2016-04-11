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
		scope.formModel.primary = false;
		scope.formState.primaryFieldVisible = true;

		scope.formState.showDescriptionInput = scope.formModel.description ? true : false;

		if ( !scope.isLoaded ) {
			var params = [ scope.formModel.game_id ];
			if ( scope.method == 'edit' ) {
				params.push( scope.formModel.id );
			}

			Api.sendRequest( '/web/dash/developer/games/packages/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;

				scope.formModel.pricing_type = 'free';

				if ( !payload.hasPrimarySellable ) {
					scope.formModel.primary = true;
					scope.formState.primaryFieldVisible = false;
				}

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

					if ( payload.sellable ) {
						scope.formModel.pricing_type = payload.sellable.type;
						scope.formModel.price = payload.sellable.pricings[0].amount / 100;
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
		}

		scope.$watch( 'formState.hasSuggestedPrice', function( val )
		{
			if ( scope.formModel.pricing_type == 'pwyw' && !val ) {
				scope.formModel.price = null;
			}
		} );

		scope.$watch( 'formState.isPrimary', function( val )
		{
			scope.formModel.primary = val;
		} );
	};

	return form;
} );
