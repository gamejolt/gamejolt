import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from './../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class App
{
	ver: number = null;
	user: any = null;

	constructor(
		@Inject( 'Meta' ) private meta: Meta
	)
	{
		'ngNoInject';
	}

	get title() { return this.meta.title; }
	set title( title: string ) { this.meta.title = title; }
}
