import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../../utils/vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { Sticker } from '../../../../../../../_common/sticker/sticker.model';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';

type StickersResponse = {
	stickers: object[];
	stickerCounts: {
		count: number;
		sticker_id: number;
	}[];
};

type StickerCount = {
	count: number;
	sticker: Sticker;
};

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppEventItemControlsFiresidePostStickersTray extends Vue {
	@Prop(propRequired(String)) resource!: string;
	@Prop(propRequired(Number)) resourceId!: number;

	stickerCounts: StickerCount[] = [];

	async mounted() {
		const result = (await Api.sendRequest('/web/posts/stickers/get-stickers', undefined, {
			detach: true,
		})) as StickersResponse;

		for (const stickerData of result.stickers) {
			const sticker = new Sticker(stickerData);
			const count = result.stickerCounts.find(i => i.sticker_id == sticker.id)!.count;
			this.stickerCounts.push({ count, sticker });
		}
	}

	onDragStart(ev: DragEvent, stickerId: number) {
		console.log(ev.target);

		const elem = ev.target as HTMLElement;
		const elemRect = elem.getBoundingClientRect();
		const mouseOffsetX = ev.clientX - elemRect.left;
		const mouseOffsetY = ev.clientY - elemRect.top;

		const dropData = {
			'resource': this.resource,
			'resourceId': this.resourceId,
			'stickerId': stickerId,
			'mouseOffset': {
				'x': mouseOffsetX,
				'y': mouseOffsetY,
			}
		};
		const dropDataStr = JSON.stringify(dropData);

		ev.dataTransfer?.setData('text', dropDataStr);
	}
}
