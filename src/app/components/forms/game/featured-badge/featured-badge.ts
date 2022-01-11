import { mixins, Options, Prop } from 'vue-property-decorator';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../../_common/environment/environment.service';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';

interface FormModel {
	color: string;
	size: Record<'width' | 'height', string>;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({})
export default class FormGameFeaturedBadge extends mixins(Wrapper) {
	@Prop({ type: Object, required: true }) game!: Game;

	get colorOptions() {
		return [
			{
				key: 'black',
				label: this.$gettext(`dark`),
			},
			{
				key: 'white',
				label: this.$gettext(`light`),
			},
		];
	}

	get sizeOptions() {
		return [
			{
				key: {
					width: '312px',
					height: '204px',
				},
				label: this.$gettext(`Large (312x204)`),
			},
			{
				key: {
					width: '156px',
					height: '102px',
				},
				label: this.$gettext(`Small (156x102)`),
			},
		];
	}

	get previewImage() {
		return {
			src: `https://gamejolt.com/img/badge/featured/${this.formModel.color}.png`,
			alt: `Follow ${this.game.title} on Game Jolt`,
			size: this.formModel.size,
		};
	}

	get processedTag() {
		const gameUrl = `href="${Environment.baseUrl}/games/${this.game.path}/${this.game.id}"`;
		const imgSize = `width="${this.formModel.size.width}" height="${this.formModel.size.height}"`;
		const imgAlt = `alt="${this.previewImage.alt.replace(/"/g, '&quot;')}"`;

		return `<a ${gameUrl}><img ${imgSize} src="${this.previewImage.src}" ${imgAlt} /></a>`;
	}

	created() {
		this.setField('color', this.colorOptions[0].key);
		this.setField('size', this.sizeOptions[0].key);
	}

	onClickCopy() {
		Clipboard.copy(this.processedTag);
	}
}
