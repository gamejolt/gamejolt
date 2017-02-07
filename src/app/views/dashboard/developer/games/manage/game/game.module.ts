import { NgModule } from 'ng-metadata/core';

import { lazyBundle } from '../../../../../../../lib/gj-lib-client/utils/angular-facade';
import { RouteGameComponent } from './game.component';

import Overview from './overview/overview';
import Details from './details/details';
import Description from './description/description';
import Thumbnail from './thumbnail/thumbnaill';
import Header from './header/header';
import Maturity from './maturity/maturity';
import Music from './music/music';
import Settings from './settings/settings';
import WizardFinish from './wizard-finish/wizard-finish';

import { NavRequiredStepIconComponent } from './nav-required-step-icon-directive';

@NgModule({
	imports: [
		Overview,
		Details,
		Description,
		Thumbnail,
		Header,
		Maturity,
		Music,
		Settings,
		WizardFinish,
	],
	declarations: [
		RouteGameComponent,
		NavRequiredStepIconComponent,
	],
})
export class RouteModule { }

lazyBundle( RouteModule );
export default RouteGameComponent;
