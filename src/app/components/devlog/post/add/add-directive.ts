import {
	Component,
	Inject,
	Input,
	Output,
	EventEmitter,
} from 'ng-metadata/core';
import * as template from '!html-loader!./add.html';

import { DevlogPostEdit } from '../edit/edit-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

@Component({
	selector: 'gj-devlog-post-add',
	template,
})
export class DevlogPostAddComponent {
	@Input('<') game: any;

	@Output() private onAdded = new EventEmitter<FiresidePost>();

	constructor(@Inject('DevlogPostEdit') private editModal: DevlogPostEdit) {}

	showAddModal(type: string) {
		Api.sendRequest(
			`/web/dash/developer/games/devlog/new-post/${this.game.id}/${type}`
		)
			.then((response: any) => {
				return new FiresidePost(response.post);
			})
			.then((post: FiresidePost) => {
				return this.editModal.show(post);
			})
			.then((post: FiresidePost) => {
				if (this.onAdded) {
					this.onAdded.emit(post);
				}
			});
	}
}
