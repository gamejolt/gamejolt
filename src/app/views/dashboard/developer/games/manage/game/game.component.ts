import { Component, Input, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./game.component.html';

import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { MediaItem } from '../../../../../../../lib/gj-lib-client/components/media-item/media-item-model';

@Component({
	selector: 'route-dash-dev-games-manage-game',
	template,
})
export class RouteGameComponent
{
	@Input() game: Game;
	@Input() isWizard: boolean;
	@Input() mediaItems: MediaItem[];
	@Input() canPublish: boolean;

	coverIsLoaded = false;

	Screen = Screen;

	constructor(
		@Inject( '$scope' ) public $scope: ng.IScope,
		@Inject( '$state' ) public $state: StateService,
	)
	{
		// For back-compat.
		$scope['manageCtrl'] = $scope.$parent['manageCtrl'];
		$scope['gameCtrl'] = this;
	}
}
