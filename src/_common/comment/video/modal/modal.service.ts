import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { CommentVideo } from '../video-model';

export class CommentVideoModal {
	static async show(video: CommentVideo) {
		return await Modal.show<void>({
			modalId: 'CommentVideo-' + video.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommentVideoModal" */ './modal.vue')
				),
			props: { video },
		});
	}
}
