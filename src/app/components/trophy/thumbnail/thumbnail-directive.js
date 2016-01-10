angular.module( 'App.Trophy.Thumbnail' ).directive( 'gjTrophyThumbnail', function( Game_Trophy )
{
	/**
	 * We do this because of stupid pixel icons!
	 * We have to figure out which size to show for the thumbnails.
	 */
	function processWidth( element )
	{
		var thumbElem = element[0].querySelector( '.trophy-thumbnail-img' );
		var imgElem = thumbElem.getElementsByTagName( 'img' )[0];

		var width = thumbElem.offsetWidth - 10;
		var multiplier = Math.floor( width / 34 );
		multiplier = Math.min( 2, Math.max( 1, multiplier ) );

		imgElem.style.width = (34 * multiplier) + 'px';
		imgElem.style.height = (35 * multiplier) + 'px';
		imgElem.classList.add( 'trophy-thumbnail-img-' + multiplier + 'x' );
	}

	return {
		restict: 'E',
		scope: {
			trophy: '=trophyThumbnailTrophy',
			isAchieved: '=?trophyThumbnailIsAchieved',
		},
		templateUrl: '/app/components/trophy/thumbnail/thumbnail.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, $timeout, Screen )
		{
			var _this = this;

			this.imgSrc = null;
			this.isLoaded = false;

			var imgMapping = {
				'bronze': '/app/components/trophy/thumbnail/bronze.png',
				'bronze-secret': '/app/components/trophy/thumbnail/bronze-secret.png',
				'silver': '/app/components/trophy/thumbnail/silver.png',
				'silver-secret': '/app/components/trophy/thumbnail/silver-secret.png',
				'gold': '/app/components/trophy/thumbnail/gold.png',
				'gold-secret': '/app/components/trophy/thumbnail/gold-secret.png',
				'platinum': '/app/components/trophy/thumbnail/platinum.png',
				'platinum-secret': '/app/components/trophy/thumbnail/platinum-secret.png',
			};

			// Make sure we don't show thumbnails for secret trophies unless they've been achieved.
			if ( this.trophy.has_thumbnail && (!this.trophy.secret || this.isAchieved) ) {
				this.imgSrc = this.trophy.img_thumbnail;
				this.isLoaded = true;
			}
			else {
				var img = '';
				if ( this.trophy.difficulty == Game_Trophy.DIFFICULTY_BRONZE ) {
					img = 'bronze';
				}
				else if ( this.trophy.difficulty == Game_Trophy.DIFFICULTY_SILVER ) {
					img = 'silver';
				}
				else if ( this.trophy.difficulty == Game_Trophy.DIFFICULTY_GOLD ) {
					img = 'gold';
				}
				else if ( this.trophy.difficulty == Game_Trophy.DIFFICULTY_PLATINUM ) {
					img = 'platinum';
				}

				if ( this.trophy.secret && !this.isAchieved ) {
					img += '-secret';
				}

				this.imgSrc = imgMapping[ img ];

				/**
				 * We delay this because it's more costly to calculate widths and stuff
				 * while things are moving around. Since it's most likely that they just
				 * landed on a new page, there may be things shifting around still. Let's calculate
				 * after to keep it fast.
				 */
				// TODO: This doesn't get updated when the window size changes.
				$timeout( function()
				{
					processWidth( $element );
					_this.isLoaded = true;
				}, 1000 );
			}
		}
	};
} );
