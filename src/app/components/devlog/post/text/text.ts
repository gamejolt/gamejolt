import { provide } from 'ng-metadata/core';
import { TextComponent } from './text-directive';

export default angular.module( 'App.Devlog.Post.Text', [] )
.directive( ...provide( TextComponent ) )
.name;
