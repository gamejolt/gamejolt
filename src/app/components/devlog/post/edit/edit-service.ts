import { Injectable, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./edit.html';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { lazyload } from '../../../../../lib/gj-lib-client/utils/utils';

@Injectable('DevlogPostEdit')
export class DevlogPostEdit {
	constructor(@Inject('$modal') private $modal: any) {}

	show(post: FiresidePost): Promise<FiresidePost> {
		const modalInstance = this.$modal.open({
			keyboard: false,
			backdrop: 'static',
			template,
			controller: 'Devlog.Post.EditModalCtrl',
			controllerAs: '$ctrl',
			size: 'sm',
			resolve: {
				// They may load this on the game page without having dash stuff loaded in yet.
				init: () => {
					return require.ensure(
						[],
						() =>
							lazyload(() => {
								require('../../../../views/dashboard/dashboard.module');
							}),
						'dash'
					);
				},
				post: () => post,
			},
		});

		return modalInstance.result;
	}
}
