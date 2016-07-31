import Marketplace from './marketplace/marketplace';
import Devlogs from './devlogs/devlogs';

export default angular.module( 'App.Views.Landing', [
	Marketplace,
	Devlogs,
] )
.name;
