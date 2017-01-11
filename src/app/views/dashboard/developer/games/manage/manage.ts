import { provide } from 'ng-metadata/core';

import Game from './game/game';
import Devlog from './devlog/devlog';
import Site from './site/site';

import { ManageCtrl } from './manage-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage', [
	Game,
	Devlog,
	Site,
] )
.controller( ...provide( 'Dashboard.Developer.Games.ManageCtrl', { useClass: ManageCtrl } ) )
.name;
