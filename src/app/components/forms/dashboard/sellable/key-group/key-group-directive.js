angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardSellableKeyGroup', function( $state, Form, Api, Sellable, Sellable_KeyGroup, Growls )
{
	var form = new Form( {
		model: 'Sellable_KeyGroup',
		template: '/app/components/forms/dashboard/sellable/key-group/key-group.html'
	} );

	form.scope.sellable = '=gjSellable';
	form.scope.keyGroup = '=?gjSellableKeyGroup';

	form.onInit = function( scope )
	{
		console.log(scope.method);

		scope.formModel.email_addresses = '';
		scope.formModel.amount = '';

		scope.formState = {};
		scope.formState.sellable_id = scope.sellable.id;
		scope.formState.keyGroup_id = scope.method == 'add' ? null : scope.keyGroup.id;

		if ( !scope.isLoaded ) {

			Api.sendRequest( '/web/dash/developer/sellables/key-groups/save/' + scope.formState.sellable_id + '/' + scope.formState.keyGroup_id ).then( function( payload )
			{
				scope.isLoaded = true;
				console.log( payload );
				angular.extend( scope.formModel, payload );
			} );
		}

	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/developer/sellables/key-groups/save/' + scope.formState.sellable_id + '/' + scope.formState.keyGroup_id, scope.formModel ).then( function( payload ) {

			if ( payload.success ) {
				console.log( payload );
				//angular.extend( scope.formModel, payload );

				if ( scope.method=='add' ) {
					$state.go( 'dashboard.developer.games.manage.packages.edit.keygroups.list', { sellableId: payload.sellable.id } );
				}
				else if ( scope.method=='edit' ) {
					Growls.success(
						'Saved',
						'Success'
					);
				}

			}

		} );
	};

	return form;
} );
