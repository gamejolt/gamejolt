angular
	.module('App.Views.Dashboard')
	.controller(
		'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ListCtrl',
		function(
			$scope,
			App,
			Game_DataStore_Item,
			ModalConfirm,
			gettextCatalog,
			payload
		) {
			var _this = this;

			App.title = gettextCatalog.getString(
				'dash.games.data_store.items.page_title',
				{ game: $scope.manageCtrl.game.title }
			);

			this.items = Game_DataStore_Item.populate(payload.items);

			this.removeItem = function(item) {
				ModalConfirm.show(
					gettextCatalog.getString(
						'dash.games.data_store.items.remove_confirmation'
					)
				)
					.then(function() {
						return item.$remove();
					})
					.then(function() {
						_.remove(_this.items, { id: item.id });
					});
			};
		}
	);
