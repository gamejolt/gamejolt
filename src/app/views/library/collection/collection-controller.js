angular
	.module('App.Views')
	.controller('Library.CollectionCtrl', function(
		$scope,
		$state,
		Location,
		App,
		Meta,
		AutoScroll,
		ModalConfirm,
		Growls,
		GamePlaylist_SaveModal,
		GameCollection,
		GamePlaylist,
		GameBundle,
		User,
		Shell,
		gettextCatalog,
		filteringContainer
	) {
		var _this = this;

		this.filteringContainer = filteringContainer;

		this.type = undefined;
		this.collection = undefined;

		this.followerCount = 0;
		this.totalGamesCount = 0;
		this.gamesCount = 0;
		this.perPage = 10;
		this.currentPage = 1;
		this.isFollowing = false;

		this.developerSorting = {
			'': gettextCatalog.getString('sorting.new'),
			best: gettextCatalog.getString('sorting.best'),
		};

		this.tagSorting = {
			'': gettextCatalog.getString('sorting.best'),
			hot: gettextCatalog.getString('sorting.hot'),
			new: gettextCatalog.getString('sorting.new'),
		};

		this.processPayload = function(payload, $stateParams) {
			// We try pulling a populated collection from the registry.
			// This will be the case if it's in their library.
			// When they don't have it registered in their library, we just make an instance of a new one.
			this.collection = _.find(Shell.collections, {
				type: payload.collection.type,
				id: payload.collection.id,
			});
			if (!this.collection) {
				this.collection = new GameCollection(payload.collection);
			}

			// Tag pages don't have slugs.
			if (this.type != 'tag') {
				Location.enforce({
					slug: this.collection.slug,
				});
			}

			this.followerCount = payload.followerCount || 0;
			this.totalGamesCount = payload.totalGamesCount || 0;
			this.gamesCount = payload.gamesCount || 0;
			this.perPage = payload.perPage;
			this.currentPage = $stateParams.page || 1;
			this.isLoading = false;
			this.isFollowing = payload.isFollowing;

			// Reset.
			this.user = null;
			this.playlist = null;
			this.bundle = null;
			this.tag = null;
			this.isOwner = false;

			var user, playlist, bundle;

			if (this.type == 'followed') {
				user = new User(payload.user);
				this.user = user;
				this.isOwner = App.user && user.id == App.user.id;
				if (this.isOwner) {
					App.title = gettextCatalog.getString(
						'library.collection.followed_owner_page_title',
						{ user: '@' + user.username }
					);
				} else {
					App.title = gettextCatalog.getString(
						'library.collection.followed_page_title',
						{ user: '@' + user.username }
					);
				}
			} else if (this.type == 'playlist') {
				playlist = new GamePlaylist(payload.playlist);
				this.playlist = playlist;
				this.isOwner = App.user && playlist.user.id == App.user.id;
				if (this.isOwner) {
					App.title = gettextCatalog.getString(
						'library.collection.playlist_owner_page_title',
						{ playlist: playlist.name, user: '@' + playlist.user.username }
					);
				} else {
					App.title = gettextCatalog.getString(
						'library.collection.playlist_page_title',
						{ playlist: playlist.name, user: '@' + playlist.user.username }
					);
				}
			} else if (this.type == 'developer') {
				user = new User(payload.developer);
				this.user = user;
				this.isOwner = App.user && user.id == App.user.id;
				if (this.isOwner) {
					App.title = gettextCatalog.getString(
						'library.collection.developer_owner_page_title',
						{ user: '@' + user.username }
					);
				} else {
					App.title = gettextCatalog.getString(
						'library.collection.developer_page_title',
						{ user: '@' + user.username }
					);
				}
			} else if (this.type == 'owned') {
				user = new User(payload.user);
				this.user = user;
				this.isOwner = App.user && user.id == App.user.id;
				if (this.isOwner) {
					App.title = gettextCatalog.getString('Your Owned Games');
				} else {
					App.title = gettextCatalog.getString('Games Owned by {{ user }}', {
						user: '@' + user.username,
					});
				}
			} else if (this.type == 'recommended') {
				user = new User(payload.user);
				this.user = user;
				this.isOwner = App.user && user.id == App.user.id;
				if (this.isOwner) {
					App.title = gettextCatalog.getString('Your Recommended Games');
				} else {
					App.title = gettextCatalog.getString(
						'Game Recommendations for {{ user }}',
						{ user: '@' + user.username }
					);
				}
			} else if (this.type == 'bundle') {
				bundle = new GameBundle(payload.bundle);
				this.bundle = bundle;
				App.title = gettextCatalog.getString(
					'library.collection.bundle_page_title',
					{ bundle: bundle.title }
				);
			} else if (this.type == 'tag') {
				this.tag = this.collection.id;
				App.title = gettextCatalog.getString(
					'library.collection.tag_page_title',
					{ tag: this.collection.id }
				);
			}

			if (payload.metaTitle) {
				App.title = payload.metaTitle;
			}

			if (payload.metaDescription) {
				Meta.description = payload.metaDescription;
			}

			if (payload.fb) {
				Meta.fb = payload.fb;
				Meta.fb.title = App.title;
			}

			if (payload.twitter) {
				Meta.twitter = payload.twitter;
				Meta.twitter.title = App.title;
			}
		};

		this.shouldShowFollow = function() {
			return !this.isOwner;
		};

		this.toggleFollow = function() {
			if (this.isFollowing) {
				this.unfollow();
			} else {
				this.follow();
			}
		};

		this.follow = function() {
			this.collection.$follow().then(function() {
				_this.isFollowing = true;
				Shell.addPlaylist(_this.collection);
			});
		};

		this.unfollow = function() {
			this.collection.$unfollow().then(function() {
				_this.isFollowing = false;
				Shell.removePlaylist(_this.collection);
			});
		};

		this.showEditPlaylist = function() {
			GamePlaylist_SaveModal.show(this.playlist).then(function() {
				_this.collection.slug = _this.playlist.slug;
				_this.collection.name = _this.playlist.name;

				// Note that we want to replace current URL since technically they didn't go anywhere.
				// We don't want to reload the controller or anything.
				AutoScroll.noScroll(true);
				$state.go(
					_this.collection.getSref(),
					_this.collection.getSrefParams(),
					{ notify: false, location: 'replace' }
				);
			});
		};

		this.removePlaylist = function() {
			ModalConfirm.show(
				gettextCatalog.getString(
					'library.playlists.remove_playlist_confirmation',
					{ playlist: _this.playlist.name }
				)
			).then(function() {
				_this.playlist
					.$remove()
					.then(function() {
						Shell.removePlaylist(_this.collection);
						$state.go('library.overview');
						Growls.success(
							gettextCatalog.getString(
								'library.playlists.remove_playlist_success_growl',
								{ playlist: _this.playlist.name }
							),
							gettextCatalog.getString(
								'library.playlists.remove_playlist_success_growl_title',
								{ playlist: _this.playlist.name }
							)
						);
					})
					.catch(function() {
						Growls.success(
							gettextCatalog.getString(
								'library.playlists.remove_playlist_error_growl',
								{ playlist: _this.playlist.name }
							),
							gettextCatalog.getString(
								'library.playlists.remove_playlist_error_growl_title',
								{ playlist: _this.playlist.name }
							)
						);
					});
			});
		};
	});
