import { provide } from 'ng-metadata/core';
import { PageHeaderComponent } from './page-header.component';

export default angular.module( 'App.PageHeader', [] )
.directive( ...provide( PageHeaderComponent ) )
.name;
