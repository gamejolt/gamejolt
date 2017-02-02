import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';

@Injectable( 'App' )
export class App
{
	ver: number | null = null;
	user: any = null;

	constructor(
		@Inject( 'Meta' ) private meta: Meta
	)
	{
	}

	get title() { return this.meta.title; }
	set title( title: string | null ) { this.meta.title = title; }
}
