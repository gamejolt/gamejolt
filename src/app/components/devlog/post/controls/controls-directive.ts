import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-post-controls',
	templateUrl: '/app/components/devlog/post/controls/controls.html',
	legacy: {
		controllerAs: '$ctrl',
	},
})
export class DevlogPostControls
{
	@Input( '<' ) post: Fireside_Post;
}