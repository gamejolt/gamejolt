import { provide } from 'ng-metadata/core';

import Overview from './overview/overview';
import Details from './details/details';
import Description from './description/description';
import Thumbnail from './thumbnail/thumbnaill';
import Header from './header/header';
import Media from './media/media';
import Maturity from './maturity/maturity';
import Music from './music/music';
import Settings from './settings/settings';

import { NavRequiredStepIconComponent } from './nav-required-step-icon-directive';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game', [
	Overview,
	Details,
	Description,
	Thumbnail,
	Header,
	Media,
	Maturity,
	Music,
	Settings,
] )
.directive( ...provide( NavRequiredStepIconComponent ) )
.name;
