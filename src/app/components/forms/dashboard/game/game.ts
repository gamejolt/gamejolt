import { GameFormFactory } from './game-directive';
import Wizard from './wizard/wizard';

export default angular.module( 'App.Forms.Dashboard.Game', [
	Wizard,
] )
.directive( 'gjFormDashboardGame', GameFormFactory )
.name
;
