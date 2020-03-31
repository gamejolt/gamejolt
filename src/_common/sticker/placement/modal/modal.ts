import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Api } from '../../../api/api.service';
import AppContentViewer from '../../../content/content-viewer/content-viewer.vue';
import { FiresidePost } from '../../../fireside/post/post-model';
import { Growls } from '../../../growls/growls.service';
import { BaseModal } from '../../../modal/base';
import { Model } from '../../../model/model.service';
import { Sticker } from '../../sticker.model';
import AppSticker from '../../sticker.vue';
import { StickerPlacement } from '../placement.model';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	components: {
		AppSticker,
		AppContentViewer,
	},
})
export default class AppStickerPlacementModal extends BaseModal {
	@Prop(propRequired(Model)) model!: Model;
	@Prop(propRequired(Sticker)) sticker!: Sticker;

	$el!: HTMLDivElement;
	$refs!: {
		mount: HTMLElement;
		sticker: HTMLElement;
	};

	placement: StickerPlacement | null = null;
	isDragging = false;
	waitingForFrame = false;
	hasDragged = false;

	lastPanX = 0;
	lastPanY = 0;

	get postLeadContent() {
		return (this.model as FiresidePost).lead_content;
	}

	created() {
		this.placement = new StickerPlacement({
			// Randomly place the sticker within the rectangle, with a padding of 20% on each side
			// --------------
			// |  |      |  |
			// 0.2  0.6   0.2
			position_x: 0.2 + 0.6 * Math.random(),
			position_y: 0.2 + 0.6 * Math.random(),
			// 0 is rotated left, 1 is rotated right, 0.5 is no rotation
			rotation: 0.5,
			sticker: this.sticker,
		});
	}

	panStart() {
		this.isDragging = true;
		this.hasDragged = true;

		this.lastPanX = 0;
		this.lastPanY = 0;
	}

	pan(event: HammerInput) {
		if (!this.waitingForFrame) {
			this.waitingForFrame = true;
			window.requestAnimationFrame(() => this.panTick(event));
		}
	}

	panTick(event: HammerInput) {
		this.waitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isDragging) {
			return;
		}

		if (!this.$refs.sticker) {
			return;
		}

		const rect = this.$refs.mount.getBoundingClientRect();
		const deltaX = (event.deltaX - this.lastPanX) / rect.width;
		const deltaY = (event.deltaY - this.lastPanY) / rect.height;
		if (this.placement) {
			this.placement.position_x += deltaX;
			this.placement.position_y += deltaY;

			if (this.placement.position_x < 0) {
				this.placement.position_x = 0;
			} else if (this.placement.position_x > 1) {
				this.placement.position_x = 1;
			}
			if (this.placement.position_y < 0) {
				this.placement.position_y = 0;
			} else if (this.placement.position_y > 1) {
				this.placement.position_y = 1;
			}
		}

		this.lastPanX = event.deltaX;
		this.lastPanY = event.deltaY;
	}

	panEnd() {
		this.isDragging = false;
		if (this.placement) {
			this.placement.rotation = Math.random();
		}
	}

	async onClickPlace() {
		const result = await Api.sendRequest(
			'/web/stickers/place',
			{
				stickerId: this.sticker.id,
				positionX: this.placement?.position_x,
				positionY: this.placement?.position_y,
				rotation: this.placement?.rotation,
				resource: 'Fireside_Post',
				resourceId: this.model.id,
			},
			{ detach: true }
		);

		if (result.success) {
			const post = new FiresidePost(result.post);
			this.modal.resolve(post);
		} else {
			Growls.error(this.$gettext(`Failed to place sticker.`));
			this.modal.dismiss();
		}
	}
}
