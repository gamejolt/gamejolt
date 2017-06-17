angular
	.module('App.Views')
	.controller('Library.OverviewCtrl', function(
		$scope,
		$timeout,
		App,
		GameCollection,
		Shell,
		gettextCatalog
	) {
		var _this = this;

		App.title = gettextCatalog.getString('library.page_title');

		this.collectionTypes = [
			{
				key: 'mainCollections',
				heading: null,
				eventLabel: 'system',
			},
			{
				key: 'playlistCollections',
				heading: 'Your Playlists',
				eventLabel: 'playlist',
			},
			{
				key: 'bundleCollections',
				heading: 'Bundles',
				eventLabel: 'bundle',
			},
			{
				key: 'followedCollections',
				heading: 'Followed Playlists',
				eventLabel: 'followed',
			},
		];

		this.mainCollections = [];
		this.bundleCollections = Shell.bundleCollections;
		this.playlistCollections = [];
		this.followedCollections = [];
		$scope.$watchCollection(
			function() {
				return Shell.collections;
			},
			function(collections) {
				_this.mainCollections = [];
				_this.bundleCollections = Shell.bundleCollections;

				if (Shell.followedCollection) {
					_this.mainCollections.push(Shell.followedCollection);
				}

				if (Shell.developerCollection) {
					_this.mainCollections.push(Shell.developerCollection);
				}

				if (Shell.ownedCollection) {
					_this.mainCollections.push(Shell.ownedCollection);
				}

				if (Shell.recommendedCollection) {
					_this.mainCollections.push(Shell.recommendedCollection);
				}

				collections.forEach(function(collection) {
					if (collection.type == 'playlist' && !collection.from_subscription) {
						_this.playlistCollections.push(collection);
					} else {
						_this.followedCollections.push(collection);
					}
				});
			}
		);
	});
