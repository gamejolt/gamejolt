angular.module( 'App.Shell' ).service( 'Shell', function( $rootScope, $timeout, $window, Screen, Backdrop, hotkeys )
{
	var _this = this;

	this.isLeftPaneVisible = false;
	this.isRightPaneVisible = false;

	this.toggleLeftPane = function()
	{
		this.isLeftPaneVisible = !this.isLeftPaneVisible;
		this.isRightPaneVisible = false;  // Always close the other pane.
		checkBackdrop();

		return this;
	};

	this.toggleRightPane = function()
	{
		this.isRightPaneVisible = !this.isRightPaneVisible;
		this.isLeftPaneVisible = false;  // Always close the other pane.
		checkBackdrop();

		return this;
	};

	var backdrop;
	function checkBackdrop()
	{
		// Ensure we have a backdrop if anything is overlayed.
		// Otherwise ensure the backdrop is gone.
		if ( _this.isLeftPaneVisible || _this.isRightPaneVisible ) {
			if ( backdrop ) {
				return;
			}

			backdrop = new Backdrop( angular.element( document.getElementById( 'shell-body' ) ) );

			backdrop.onCloseTrigger = function()
			{
				// If they clicked the backdrop or something, close all overlayed panes.
				_this.isLeftPaneVisible = false;
				_this.isRightPaneVisible = false;
				destroyBackdrop();
			};
		}
		else if ( backdrop ) {
			destroyBackdrop();
		}
	}

	function destroyBackdrop()
	{
		backdrop.remove();
		backdrop = null;
	}

	/**
	 * After changing states, hide all overlays.
	 */
	$rootScope.$on( '$stateChangeStart', function()
	{
		_this.isLeftPaneVisible = false;
		_this.isRightPaneVisible = false;
		checkBackdrop();
	} );
} );
