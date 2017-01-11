import { provide } from 'ng-metadata/core';
import { SiteCtrl } from './site-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Site', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.SiteCtrl', { useClass: SiteCtrl } ) )
.name;
