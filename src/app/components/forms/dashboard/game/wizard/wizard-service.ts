import { Injectable, Inject } from 'ng-metadata/core';

const STATE_PREFIX = 'dashboard.developer.games.manage.game.';

const TRANSITION_MAP = {
	'details': 'description',
	'description': 'maturity',
	'maturity': 'thumbnail',
	'thumbnail': 'header',
	'header': 'media.list',
	'media': 'packages.list',
	'packages': 'music',
	'music': 'settings',
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
		for ( const current in TRANSITION_MAP ) {
			if ( this.$state.includes( `${STATE_PREFIX}${current}` ) ) {
				const next = TRANSITION_MAP[ current ];
				this.$state.go( `${STATE_PREFIX}${next}` );
				return;
			}
		}
	}
}
