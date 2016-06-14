import { DevlogPostFormFactory } from './game/devlog-post/devlog-post-directive';

export const FormsModule = angular.module( 'App.Forms.Dashboard', [] )
.directive( 'gjFormDashboardGameDevlogPost', DevlogPostFormFactory )
.name
;
