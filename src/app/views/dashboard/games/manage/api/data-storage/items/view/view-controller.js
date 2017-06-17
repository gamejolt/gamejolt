angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ViewCtrl',
		function(
			$scope,
			$state,
			App,
			Game_DataStore_Item,
			ModalConfirm,
			gettextCatalog,
			payload,
		) {
			var _this = this;

			App.title = gettextCatalog.getString(
				'dash.games.data_store.items.view.page_title',
				{ game: $scope.manageCtrl.game.title },
			);

			this.item = new Game_DataStore_Item(payload.item);

			this.remove = function() {
				ModalConfirm.show(
					gettextCatalog.getString(
						'dash.games.data_store.items.remove_confirmation',
					),
				)
					.then(function() {
						return _this.item.$remove();
					})
					.then(function() {
						$state.go('^.list');
					});
			};
		},
	);
