import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./cover-buttons.html?style=./cover-buttons.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { arrayUnique } from '../../../../lib/gj-lib-client/utils/array';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { GameDownloader } from '../../../../lib/gj-lib-client/components/game/downloader/downloader.service';
import { GamePlayModal } from '../../../../lib/gj-lib-client/components/game/play-modal/play-modal.service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameCoverButtons extends Vue
{
	@Prop( Game ) game: Game;
	@Prop( Array ) packages: GamePackage[];
	@Prop( Array ) installableBuilds: GameBuild[];
	@Prop( Array ) browserBuilds: GameBuild[];

	// TODO
	// isGamePatching = undefined;
	// hasLocalPackage = false;

	private chooseBuild( builds: GameBuild[], defaultBuild?: GameBuild )
	{
		let chosen: GameBuild | undefined;

		// Do we have to choose between multiple?
		if ( builds.length > 1 ) {

			const packageIds = arrayUnique(
				builds.map( ( item ) => item.game_package_id ),
			);

			// All builds in same package, so choose the default one.
			if ( packageIds.length <= 1 ) {
				if ( defaultBuild ) {
					chosen = defaultBuild;
				}
			}
			else {

				// When there's more than one package, we have to give them the
				// option of what to play/download.
				this.$emit( 'multiple' );
				return false;
			}
		}

		if ( !chosen ) {
			chosen = builds[0];
		}

		return chosen;
	}

	play()
	{
		Analytics.trackEvent( 'game-cover-buttons', 'download', 'play' );

		// Prioritize HTML build.
		const defaultBuild = this.browserBuilds.find( ( item ) =>
			item.type === GameBuild.TYPE_HTML
		);

		const build = this.chooseBuild( this.browserBuilds, defaultBuild );
		if ( build ) {
			GamePlayModal.show( this.game, build );
		}
	}

	download()
	{
		Analytics.trackEvent( 'game-cover-buttons', 'download', 'download' );

		const os = Device.os();
		const arch = Device.arch();
		const defaultBuild = Game.chooseBestBuild( this.installableBuilds, os, arch );

		const build = this.chooseBuild( this.installableBuilds, defaultBuild );
		if ( build ) {

			// If the build belongs to a pwyw package, open up the package
			// payment form.
			if ( build._package!.shouldShowNamePrice() ) {
				this.$emit( 'buy', build._package );
				return;
			}

			GameDownloader.download( this.$router, this.game, build );
		}
	}

	buy()
	{
		// We pull the primary package for this game.
		// It's basically the package that has its sellable
		// as the game's primary sellable.
		this.$emit( 'buy', this.packages.find( ( item ) =>
			item._sellable!.id === this.game.sellable.id
		) );
	}
}
