import { Injectable, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';

const STATE_PREFIX = 'dash.games.manage.game.';

const TRANSITION_MAP: any = {
	details: 'description',
	description: 'maturity',
	maturity: 'thumbnail',
	thumbnail: 'header',
	header: 'media',
	media: 'packages.list',
	packages: 'music',
	music: 'settings',
	settings: 'wizard-finish',
};

const TRANSITION_MAP_DEVLOG: any = {
	details: 'description',
	description: 'maturity',
	maturity: 'thumbnail',
	thumbnail: 'header',
	header: 'settings',
	settings: 'wizard-finish',
};

@Injectable('FormDashboardGameWizard')
export class FormDashboardGameWizard {
	constructor(@Inject('$state') private $state: StateService) {}

	start(game: any) {
		this.$state.go(`${STATE_PREFIX}description`, { id: game.id, wizard: true });
	}

	goNext(game: any) {
		let transitionMap = TRANSITION_MAP;
		if (game._is_devlog) {
			transitionMap = TRANSITION_MAP_DEVLOG;
		}

		for (const current in transitionMap) {
			if (this.$state.includes(`${STATE_PREFIX}${current}`)) {
				const next = transitionMap[current];
				this.$state.go(`${STATE_PREFIX}${next}`, { wizard: true });
				return;
			}
		}
	}
}
