import { Component, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-nav-required-step-icon',
	template: `
		<span class="nav-required-step-icon" ng-switch="$ctrl.isComplete">
			<span ng-switch-when="false" class="nav-required-step-icon-incomplete" gj-tooltip="{{ 'Required Step' | translate }}">
				<span class="jolticon jolticon-notice"></span>
			</span>
			<span ng-switch-when="true" class="nav-required-step-icon-complete" gj-tooltip="{{ 'Complete!' | translate }}">
				<span class="jolticon jolticon-check"></span>
			</span>
		</span>
	`,
})
export class NavRequiredStepIconComponent
{
	@Input( '<' ) isComplete: boolean;
}
