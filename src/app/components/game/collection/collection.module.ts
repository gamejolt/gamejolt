import { NgModule } from 'ng-metadata/core';
import { GameCollection } from './collection.model';

@NgModule({
	providers: [{ provide: 'GameCollection', useFactory: () => GameCollection }],
})
export class GameCollectionModule {}
