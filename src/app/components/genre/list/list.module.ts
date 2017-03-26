import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGenreList } from './list';

@NgModule({
	declarations: [
		makeComponentProvider( AppGenreList ),
	],
})
export class GenreListModule { }
