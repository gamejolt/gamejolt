angular
	.module('App.Views')
	.controller('Library.Collection.ListingCtrl', function(
		$scope,
		$state,
		$stateParams,
		App,
		Game,
		ModalConfirm,
		Growls,
		gettextCatalog,
		payload,
	) {
		var _this = this;

		var collectionCtrl = $scope.collectionCtrl;
		collectionCtrl.type = $state.current.data.collectionType;

		this.processPayload = function(payload) {
			this.games = Game.populate(payload.games);
			collectionCtrl.processPayload(payload, $stateParams);

			// Controls on thumbnails.
			this.thumbnailControl = '';
			if (
				App.user &&
				collectionCtrl.collection.owner &&
				collectionCtrl.collection.owner.id == App.user.id
			) {
				if (collectionCtrl.type == 'playlist') {
					this.thumbnailControl = 'remove';
					this.thumbnailControlLabel = gettextCatalog.getString(
						'library.collection.thumbnail_control_playlist_tooltip',
					);
					this.thumbnailControlAction = this.removeFromPlaylist;
				} else if (collectionCtrl.type == 'followed') {
					this.thumbnailControl = 'subscribed';
					this.thumbnailControlLabel = gettextCatalog.getString(
						'library.collection.thumbnail_control_unfollow_tooltip',
					);
					this.thumbnailControlAction = this.removeFromLibrary;
				}
			}
		};

		this.removeFromPlaylist = function(game) {
			var playlist = collectionCtrl.playlist;

			ModalConfirm.show(
				gettextCatalog.getString('library.playlists.remove_game_confirmation', {
					game: game.title,
					playlist: playlist.name,
				}),
			).then(function() {
				playlist
					.$removeGame(game.id)
					.then(function() {
						Growls.success(
							gettextCatalog.getString(
								'library.playlists.remove_game_success_growl',
								{ game: game.title, playlist: playlist.name },
							),
							gettextCatalog.getString(
								'library.playlists.remove_game_success_growl_title',
								{ game: game.title, playlist: playlist.name },
							),
						);
						_this._removeGame(game);
					})
					.catch(function() {
						Growls.error(
							gettextCatalog.getString(
								'library.playlists.remove_game_error_growl',
								{ game: game.title, playlist: playlist.name },
							),
							gettextCatalog.getString(
								'library.playlists.remove_game_error_growl_title',
								{ game: game.title, playlist: playlist.name },
							),
						);
					});
			});
		};

		this.removeFromLibrary = function(game) {
			ModalConfirm.show(
				gettextCatalog.getString('library.followed.remove_game_confirmation', {
					game: game.title,
				}),
			).then(function() {
				game
					.$unfollow()
					.then(function() {
						Growls.success(
							gettextCatalog.getString(
								'library.followed.remove_game_success_growl',
								{ game: game.title },
							),
							gettextCatalog.getString(
								'library.followed.remove_game_success_growl_title',
								{ game: game.title },
							),
						);
						_this._removeGame(game);
					})
					.catch(function() {
						Growls.error(
							gettextCatalog.getString(
								'library.followed.remove_game_error_growl',
								{ game: game.title },
							),
							gettextCatalog.getString(
								'library.followed.remove_game_error_growl_title',
								{ game: game.title },
							),
						);
					});
			});
		};

		this._removeGame = function(game) {
			_.remove(this.games, { id: game.id });
			--collectionCtrl.gamesCount;
			--collectionCtrl.totalGamesCount;
		};

		this.processPayload(payload);
	});
