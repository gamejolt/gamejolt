import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { FiresidePost } from '../../fireside/post/post-model';
import { Growls } from '../../growls/growls.service';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

export function getStickerTargetId(resource: string, resourceId: number) {
	return 'sticker-target-' + resource + '-' + resourceId.toString();
}

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue {
	@Prop(propRequired(Array)) stickers!: StickerPlacement[];
	@Prop(propRequired(String)) resource!: string;
	@Prop(propRequired(Number)) resourceId!: number;

	$refs!: {
		target: HTMLDivElement
	}

	get divId() {
		return getStickerTargetId(this.resource, this.resourceId);
	}

	onDragOver(ev: DragEvent) {
		ev.preventDefault();
	}

	onDrop(ev: DragEvent) {
		ev.preventDefault();

		const data = ev.dataTransfer?.getData('text');
		if (data) {
			const dropData = JSON.parse(data);
			const resource = dropData.resource;
			const resourceId = dropData.resourceId;
			if (resource === this.resource && resourceId === this.resourceId) {
				const stickerId = dropData.stickerId;
				const mouseOffsetX = dropData.mouseOffset.x;
				const mouseOffsetY = dropData.mouseOffset.y;

				const rect = this.$refs.target.getBoundingClientRect();
				const positionX = (ev.clientX - rect.left - mouseOffsetX) / rect.width;
				const positionY = (ev.clientY - rect.top - mouseOffsetY) / rect.height;

				this.dropSticker(stickerId, positionX, positionY);
			}
		}
	}

	async dropSticker(stickerId: number, positionX: number, positionY: number) {
		console.log(stickerId, positionX, positionY);
		const result = await Api.sendRequest('/web/posts/stickers/add', {
			stickerId,
			positionX,
			positionY,
			resource: this.resource,
			resourceId: this.resourceId,
		}, { detach: true });

		if (result.success === true && result.post) {
			const post = new FiresidePost(result.post);
			console.log(post.stickers);
			this.$emit('sticker-add', post);
		} else {
			Growls.error(this.$gettext(`Failed to place sticker on this post. Refresh the page and try again.`));
		}
	}
}
