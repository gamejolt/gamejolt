import { provide } from 'ng-metadata/core';
import { SplitTest } from './split-test-service';

export default angular.module( 'App.SplitTest', [] )
.service( ...provide( 'SplitTest', { useClass: SplitTest } ) )
.name;
