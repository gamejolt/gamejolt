import { Injectable, Inject } from 'ng-metadata/core';

const STATE_PREFIX = 'dashboard.developer.games.manage.game.';

const TRANSITION_MAP = {
	'details': 'description',
	'description': 'thumbnail',
	'thumbnail': 'header',
	'header': 'media',
	'media': 'maturity',
	'maturity': 'settings',
};

@Injectable()
export class FormDashboardGameWizard
{
	constructor(
		@Inject( '$state' ) private $state: ng.ui.IStateService
	)
	{
	}

	goNext()
	{
		const current = this.$state.current.name.replace( STATE_PREFIX, '' );
		const next = TRANSITION_MAP[ current ];
		if ( next ) {
			this.$state.go( `${STATE_PREFIX}${next}` );
		}
	}
}
