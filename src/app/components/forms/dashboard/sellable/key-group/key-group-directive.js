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
		scope.formModel.sellable_id = scope.sellable.id;
		scope.formModel.email_addresses = '';
		scope.formModel.amount = '';

		if ( !scope.isLoaded ) {
			if ( scope.method == 'edit' ) {
				Api.sendRequest( '/web/dash/developer/sellables/key-groups/save/' + scope.sellable.id + '/' + scope.keyGroup.id ).then( function( payload )
				{
					scope.isLoaded = true;
					console.log( payload );
					angular.extend( scope, payload );
				} );
			}
			else {
				scope.isLoaded = true;
			}
		}
	};

	return form;
} );
