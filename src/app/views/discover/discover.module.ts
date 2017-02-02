import { NgModule } from 'ng-metadata/core';

import Devlogs from './devlogs/devlogs';
import DevlogsTag from './devlogs-tag/devlogs-tag';
import GameDevlog from './games/view/devlog/devlog';
import GameComments from './games/view/comments/comments';

@NgModule({
	imports: [
		GameDevlog,
		GameComments,
		Devlogs,
		DevlogsTag,
	],
})
export class Discover { }
