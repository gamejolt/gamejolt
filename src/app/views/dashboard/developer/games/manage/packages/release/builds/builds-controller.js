angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Release.BuildsCtrl', function(
	$scope, $state, $timeout, App, Game_Release, Game_Build, Game_Build_File, Game_Build_LaunchOption, Game_Build_Param, ModalConfirm, Growls, AutoScroll, gettextCatalog, payload )
{
	var _this = this;
	var manageCtrl = $scope.manageCtrl;
	var releaseCtrl = $scope.releaseCtrl;

	App.title = gettextCatalog.getString( 'dash.games.releases.builds.page_title', {
		game: manageCtrl.game.title,
		package: releaseCtrl.packageTitle,
		release: releaseCtrl.release.version_number,
	} );

	this.isAdding = false;
	this.activeItem = null;
	this.buildTab = 'edit';

	this.launchOptions = Game_Build_LaunchOption.populate( payload.launchOptions );
	this.launchOptionsByBuild = _.groupBy( this.launchOptions, 'game_build_id' );

	this.params = Game_Build_Param.populate( payload.params );
	this.paramsByBuild = _.groupBy( this.params, 'game_build_id' );

	this.supplementalFiles = Game_Build_File.populate( payload.supplementalFiles );
	this.supplementalFilesByBuild = _.groupBy( this.supplementalFiles, 'game_build_id' );

	this.buildDownloadCounts = payload.buildDownloadCounts;

	this.platformsInfo = {
		windows: {
			icon: 'windows',
			label: gettextCatalog.getString( 'dash.games.releases.builds.windows_tag' ),
		},
		windows_64: {
			icon: 'windows',
			label: gettextCatalog.getString( 'dash.games.releases.builds.windows_64_tag' ),
		},
		mac: {
			icon: 'mac',
			label: gettextCatalog.getString( 'dash.games.releases.builds.mac_tag' ),
		},
		mac_64: {
			icon: 'mac',
			label: gettextCatalog.getString( 'dash.games.releases.builds.mac_64_tag' ),
		},
		linux: {
			icon: 'linux',
			label: gettextCatalog.getString( 'dash.games.releases.builds.linux_tag' ),
		},
		linux_64: {
			icon: 'linux',
			label: gettextCatalog.getString( 'dash.games.releases.builds.linux_64_tag' ),
		},
		other: {
			icon: 'other-os',
			label: gettextCatalog.getString( 'dash.games.releases.builds.other_tag' ),
		},
	};

	this.onBuildAdded = onBuildAdded;
	this.onBuildEdited = onBuildEdited;
	this.removeBuild = removeBuild;
	this.onLaunchOptionsSet = onLaunchOptionsSet;
	this.onParamAdded = onParamAdded;
	this.removeParam = removeParam;
	this.onFileAdded = onFileAdded;
	this.removeFile = removeFile;
	this.onBuildProcessingComplete = onBuildProcessingComplete;

	$scope.$watch( 'buildsCtrl.activeItem', activeItemWatcher );
	$scope.$watch( 'buildsCtrl.isAdding', isAddingWatcher );

	function activeItemWatcher( newId, oldVal )
	{
		// The first time the page loads, we don't want to switch states.
		if ( newId === oldVal ) {
			return;
		}

		AutoScroll.noScroll( true );

		// Changing active build.
		// We want to reset the to the edit tab always.
		if ( newId && oldVal ) {
			_this.buildTab = 'edit';
		}

		if ( newId ) {
			$state.go( 'dashboard.developer.games.manage.packages.release.builds.' + _this.buildTab, { buildId: parseInt( newId, 10 ) }, { location: 'replace' } );
		}
		else {
			$state.go( 'dashboard.developer.games.manage.packages.release.builds', {}, { location: 'replace' } );
			_this.buildTab = 'edit';
		}
	}

	function isAddingWatcher( isAdding, oldVal )
	{
		// The first time the page loads, we don't want to switch states.
		if ( isAdding === oldVal ) {
			return;
		}

		AutoScroll.noScroll( true );

		if ( isAdding ) {
			$state.go( 'dashboard.developer.games.manage.packages.release.builds.add', {}, { location: 'replace' } );
		}
		else {
			$state.go( 'dashboard.developer.games.manage.packages.release.builds', {}, { location: 'replace' } );
			_this.buildTab = 'edit';
		}
	}

	function onBuildAdded( build, response )
	{
		++releaseCtrl.release.build_count;
		releaseCtrl.builds.push( build );
		this.isAdding = false;

		resetLaunchOptionsForBuild( build, response );
		checkIncompleteRedirect( build );
	}

	function onBuildEdited( build, response )
	{
		this.activeItem = null;
		resetLaunchOptionsForBuild( build, response );
		checkIncompleteRedirect( build );
	}

	/**
	 * Keeps the global list of launch options up to date after a build save.
	 */
	function resetLaunchOptionsForBuild( build, response )
	{
		_.remove( _this.launchOptions, { game_build_id: build.id } );

		if ( response.launchOptions ) {
			var launchOptions = Game_Build_LaunchOption.populate( response.launchOptions );
			_this.launchOptions = _.union( _this.launchOptions, launchOptions );
		}

		_this.launchOptionsByBuild = _.groupBy( _this.launchOptions, 'game_build_id' );
	}

	/**
	 * Should call after a build is saved so we can check if the status is no incomplete.
	 * If it is, we should direct them to the launch options page to fill them in.
	 */
	function checkIncompleteRedirect( build )
	{
		// We need to wait for the current state to switch before we redirect to the launch options.
		$timeout( function()
		{
			if ( build.hasError( Game_Build.ERROR_LAUNCH_OPTIONS ) ) {
				_this.isAdding = false;
				_this.activeItem = build.id;
				_this.buildTab = 'launch-options';
			}
		} );
	}

	function removeBuild( build )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.releases.builds.remove_build_confirmation' ) )
			.then( function()
			{
				return build.$remove();
			} )
			.then( function()
			{
				--releaseCtrl.release.build_count;
				_.remove( releaseCtrl.builds, { id: build.id } );

				Growls.success(
					gettextCatalog.getString( 'dash.games.releases.builds.remove_build_growl' ),
					gettextCatalog.getString( 'dash.games.releases.builds.remove_build_growl_title' )
				);
			} );
	}

	function onLaunchOptionsSet( build, response )
	{
		var launchOptions = Game_Build_LaunchOption.populate( response.launchOptions );

		_.remove( this.launchOptions, { game_build_id: build.id } );
		this.launchOptions = _.union( this.launchOptions, launchOptions );
		this.launchOptionsByBuild = _.groupBy( this.launchOptions, 'game_build_id' );
	}

	function onParamAdded( param )
	{
		this.params.push( param );
		this.paramsByBuild = _.groupBy( this.params, 'game_build_id' );
	};

	function removeParam( param )
	{
		param.$remove( manageCtrl.game.id, releaseCtrl.package.id, releaseCtrl.release.id ).then( function()
		{
			_.remove( _this.builds, { id: param.id } );
			_.remove( _this.paramsByBuild[ param.game_build_id ], { id: param.id } );
		} );
	};

	function onFileAdded( file )
	{
		this.supplementalFiles.push( file );
		this.supplementalFilesByBuild = _.groupBy( this.supplementalFiles, 'game_build_id' );
	};

	function removeFile( file )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.releases.builds.remove_extra_file_confirmation' ) )
			.then( function()
			{
				return file.$remove( manageCtrl.game.id, releaseCtrl.package.id, releaseCtrl.release.id );
			} )
			.then( function()
			{
				_.remove( _this.supplementalFiles, { id: file.id } );
				_.remove( _this.supplementalFilesByBuild[ file.game_build_id ], { id: file.id } );
			} );
	};

	function onBuildProcessingComplete( build, response )
	{
		// Just copy over the new build data into our current one.
		build.assign( response.build );
	};
} );
