angular.module( 'App.Rating.Widget' ).directive( 'gjRatingWidget', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/rating/widget/widget.html',
		scope: {
			game: '=ratingWidgetGame',
			gameRating: '=?ratingWidgetRating',
			isBig: '=?ratingWidgetBig',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $rootScope, $q, $transition, $element, Game_Rating, gettextCatalog )
		{
			var _this = this;

			this.labels = [];
			this.clearLabel = '';
			this.hovered = 0;
			this.isProcessing = false;

			this.labels.push( gettextCatalog.getString( 'rating.one' ) );
			this.labels.push( gettextCatalog.getString( 'rating.two' ) );
			this.labels.push( gettextCatalog.getString( 'rating.three' ) );
			this.labels.push( gettextCatalog.getString( 'rating.four' ) );
			this.labels.push( gettextCatalog.getString( 'rating.five' ) );

			this.hover = function( index )
			{
				if ( angular.isUndefined( index ) ) {
					this.hovered = 0;
				}
				else {
					this.hovered = index;
				}
			};

			this.select = function( index )
			{
				if ( this.isProcessing ) {
					return;
				}

				this.isProcessing = true;

				var gameRating = new Game_Rating( {
					game_id: _this.game.id,
					rating: index,
				} );

				gameRating.$save()
					.then( function()
					{
						_this.gameRating = gameRating;
						_this.isProcessing = false;

						$rootScope.$broadcast( 'onGameRatingChange', _this.game.id );
					} )
					.then( function()
					{
						// Does a bounce animation after rating.
						var blips = $element[0].querySelectorAll( '.rating-widget-icon:nth-child(-n+' + index + ')' );
						if ( blips.length ) {
							blips = angular.element( blips );

							var anims = [];
							for ( var i = 0; i < blips.length; ++i ) {
								var blip = blips.eq( i );
								anims.push( $transition( blip, 'rating-widget-icon-bounce', { animation: true } ) );
							}

							$q.all( anims ).then( function()
							{
								blips.removeClass( 'rating-widget-icon-bounce' );
							} );
						}
					} );
			};

			this.clear = function()
			{
				if ( this.isProcessing ) {
					return;
				}

				this.isProcessing = true;

				this.gameRating.$remove()
					.then( function()
					{
						_this.gameRating = null;
						_this.isProcessing = false;

						$rootScope.$broadcast( 'onGameRatingChange', _this.game.id );
					} );
			};
		}
	};
} );
