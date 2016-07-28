import Overview from './overview/overview';
import Games from './games/games';

export default angular.module( 'App.Views.Devlogs', [
	Overview,
	Games,
] )
.name;
