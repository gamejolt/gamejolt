import { provide } from 'ng-metadata/core';
import { DevlogPostAddComponent } from './add-directive';

export default angular
	.module('App.Devlog.Post.Add', [])
	.directive(...provide(DevlogPostAddComponent)).name;
