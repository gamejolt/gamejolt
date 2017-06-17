var GamePackagePayloadModel = require('../../../../../../lib/gj-lib-client/components/game/package/package-payload.model')
	.GamePackagePayloadModel;

angular
	.module('App.Views')
	.controller('Discover.Games.View.OverviewCtrl', function(
		$scope,
		$stateParams,
		$transition$,
		App,
		Meta,
		Game,
		Game_Screenshot,
		Game_Song,
		Game_Video,
		GameSketchfab,
		Fireside_Post,
		Game_Package,
		Game_Release,
		Game_Build,
		Game_Build_LaunchOption,
		User,
		Environment,
		Jam,
		Comment_Video,
		ActivityFeedService,
		History,
		Api,
		Payload,
		Analytics,
		SplitTest,
		Device,
		PartnerReferral,
		gettextCatalog,
	) {
		var _this = this;
		var wasHistoricalView = History.inHistorical;

		$scope.Game = Game;

		this.isLoaded = false;
		this.currentCommentPage = $stateParams.comment_page;
		this.videoCommentsPage = 0;

		this.isShowingRatingBreakdown = false;

		$scope.$watch('::gameCtrl.game', function(game) {
			if (angular.isUndefined(game)) {
				return;
			}

			_this.game = game;
			App.title =
				game.title +
				' by ' +
				game.developer.display_name +
				' (@' +
				game.developer.username +
				')';
		});

		$scope.$watch('gameCtrl.hasScores && gameCtrl.trophiesCount', function(
			val,
		) {
			// Whether or now the achievements row should be two columns.
			// When there is both scores and trophies, we split them in half.
			_this.isAchievementsTwoCol = val;
		});

		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		var apiOverviewUrl = '/web/discover/games/overview/' + $stateParams.id;
		var ref = PartnerReferral.getReferrer('Game', $stateParams.id);
		if (ref) {
			apiOverviewUrl += '?ref=' + ref;
		}

		Api.sendRequest(apiOverviewUrl)
			.then(function(payload) {
				_this.init(payload);

				// We set our state to skip tracking in the state definition.
				// Track it manually here.
				// This ensures that any experiments set in the payload get tracked as well.
				Analytics.trackPageview();
			})
			.catch(function(e) {
				Payload.handlePayloadError($transition$, e);
			});

		this.init = function(payload) {
			this.isLoaded = true;

			Meta.description = payload.metaDescription;
			Meta.fb = payload.fb;
			Meta.twitter = payload.twitter;

			if (payload.microdata) {
				Meta.microdata = payload.microdata;
			}

			this.profileCount = payload.profileCount || 0;
			this.downloadCount = payload.downloadCount || 0;
			this.playCount = payload.playCount || 0;

			this.developerGamesCount = payload.developerGamesCount;

			$scope.gameCtrl.mediaItems = [];
			if (payload.mediaItems && payload.mediaItems.length) {
				payload.mediaItems.forEach(function(item) {
					if (item.media_type == 'image') {
						$scope.gameCtrl.mediaItems.push(new Game_Screenshot(item));
					} else if (item.media_type == 'video') {
						$scope.gameCtrl.mediaItems.push(new Game_Video(item));
					} else if (item.media_type == 'sketchfab') {
						$scope.gameCtrl.mediaItems.push(new GameSketchfab(item));
					}
				});
			}

			this.scoresPayload = _.pick(payload, [
				'scoreTables',
				'scoreTable',
				'scores',
				'scoresUserBestScore',
				'scoresUserScorePlacement',
				'scoresUserScoreExperience',
			]);

			this.trophiesPayload = _.pick(payload, [
				'trophies',
				'trophiesAchieved',
				'trophiesExperienceAchieved',
				'trophiesShowInvisibleTrophyMessage',
			]);

			this.posts = ActivityFeedService.bootstrap(
				Fireside_Post.populate(payload.posts),
				{ inHistorical: wasHistoricalView },
			);
			this.songs = Game_Song.populate(payload.songs);
			this.recommendedGames = Game.populate(payload.recommendedGames);
			this.supporters = User.populate(payload.supporters);
			this.videoComments = Comment_Video.populate(payload.videoComments);
			this.videoCommentsCount = payload.videoCommentsCount || 0;

			var packageData = new GamePackagePayloadModel(payload);
			Object.assign(this, packageData);

			var os = Device.os();
			var arch = Device.arch();

			$scope.gameCtrl.packages = this.packages || [];
			$scope.gameCtrl.installableBuilds = Game.pluckInstallableBuilds(
				this.packages || [],
				os,
				arch,
			);
			$scope.gameCtrl.browserBuilds = Game.pluckBrowserBuilds(
				this.packages || [],
			);

			// On Client we only want to include HTML games.
			if (GJ_IS_CLIENT) {
				$scope.gameCtrl.browserBuilds = _.where($scope.gameCtrl.browserBuilds, {
					type: Game_Build.TYPE_HTML,
				});
			}

			// Pull in ROMs to the browser builds.
			$scope.gameCtrl.browserBuilds = $scope.gameCtrl.browserBuilds.concat(
				Game.pluckRomBuilds(_this.packages || []),
			);

			// The releases section exists if there are releases or songs.
			this.hasReleasesSection = this.releases.length || this.songs.length;

			// For game stats.
			this.playsTooltip = false;
			this.showNaPlays = false;

			if (!this.packages.length) {
				// If they had plays from a previous build but no longer have builds.
				if (this.playCount + this.downloadCount) {
					this.playsTooltip = gettextCatalog.getString(
						'This game used to have playable builds but they have been removed.',
					);
				} else {
					this.showNaPlays = true;
					this.playsTooltip = gettextCatalog.getString(
						'This game has no playable builds yet.',
					);
				}
			}

			// Active jams it may be in.
			if (payload.activeJam) {
				this.activeJam = new Jam(payload.activeJam);
			}

			// Partner referral system.
			if (payload.partnerReferredKey && payload.partnerReferredBy) {
				this.partnerReferredKey = payload.partnerReferredKey;
				this.partnerReferredBy = new User(payload.partnerReferredBy);
				this.partnerNoCut = payload.partnerNoCut || false;
			}
		};

		this.loadMoreVideoComments = function() {
			var _this = this;
			++this.videoCommentsPage;
			Api.sendRequest(
				'/web/discover/games/videos/' +
					$stateParams.id +
					'?page=' +
					this.videoCommentsPage,
			).then(function(response) {
				_this.videoComments = _this.videoComments.concat(
					Comment_Video.populate(response.videos),
				);
			});
		};
	});
