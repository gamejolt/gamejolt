import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class ModalCtrl
{
	from: string;
	to: string;
	action: string;

	constructor(
		@Inject( '$modalInstance' ) private $modalInstance: any,
		@Inject( 'Game' ) private gameModel: any,
		@Inject( 'game' ) public game: any,
		@Inject( 'stage' ) public stage: number,
	)
	{
		this.from = this._getStatusString( this.game.development_status );
		this.to = this._getStatusString( this.stage );
		this.action = `${this.from}:${this.to}`;
	}

	private _getStatusString( stage: number )
	{
		if ( stage == this.gameModel.DEVELOPMENT_STATUS_DEVLOG ) {
			return 'devlog';
		}
		else if ( stage == this.gameModel.DEVELOPMENT_STATUS_WIP ) {
			return 'wip';
		}

		return 'finished';
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
