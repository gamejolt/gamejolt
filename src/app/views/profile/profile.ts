import { provide } from 'ng-metadata/core';
import Library from './library/library';
import Overview from './overview/overview';
import Videos from './videos/videos';

import { ProfileCtrl } from './profile-controller';

export default angular.module( 'App.Views.Profile', [
	Library,
	Overview,
	Videos,
] )
.controller( ...provide( 'ProfileCtrl', { useClass: ProfileCtrl } ) )
.name;
