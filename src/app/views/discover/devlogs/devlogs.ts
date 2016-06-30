import { provide } from 'ng-metadata/core';
import Overview from './overview/overview';

export default angular.module( 'App.Views.Devlogs', [
	Overview,
] )
.name;
