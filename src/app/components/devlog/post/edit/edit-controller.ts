import { Injectable, Inject } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable('ModalCtrl')
export class ModalCtrl {
	constructor(
		@Inject('$modalInstance') private $modalInstance: any,
		@Inject('post') public post: FiresidePost,
	) {}

	onSubmitted(post: FiresidePost) {
		this.$modalInstance.close(post);
	}

	close() {
		this.$modalInstance.dismiss();
	}
}
