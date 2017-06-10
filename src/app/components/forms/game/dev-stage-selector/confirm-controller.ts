import { Injectable, Inject } from 'ng-metadata/core';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';

@Injectable( 'ModalCtrl' )
export class ModalCtrl
{
	from: string;
	to: string;
	action: string;

	fromTranslated: string;
	toTranslated: string;

	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'game' ) public game: any,
		@Inject( 'stage' ) public stage: number,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		this.from = this._getStatusString( this.game.development_status );
		this.to = this._getStatusString( this.stage );
		this.action = `${this.from}:${this.to}`;

		this.fromTranslated = this._getStatusTranslated( this.game.development_status );
		this.toTranslated = this._getStatusTranslated( this.stage );
	}

	private _getStatusTranslated( stage: number )
	{
		if ( stage === Game.DEVELOPMENT_STATUS_DEVLOG ) {
			return this.gettextCatalog.getString( 'devlog-only', {}, 'development status' );
		}
		else if ( stage === Game.DEVELOPMENT_STATUS_WIP ) {
			return this.gettextCatalog.getString( 'early access', {}, 'development status' );
		}

		return this.gettextCatalog.getString( 'complete', {}, 'development status' );
	}

	private _getStatusString( stage: number )
	{
		if ( stage === Game.DEVELOPMENT_STATUS_DEVLOG ) {
			return 'devlog';
		}
		else if ( stage === Game.DEVELOPMENT_STATUS_WIP ) {
			return 'wip';
		}

		return 'complete';
	}

	proceed()
	{
		this.$modalInstance.close( true );
	}

	cancel()
	{
		this.$modalInstance.dismiss();
	}
}
