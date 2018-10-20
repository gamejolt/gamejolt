import View from '!view!./description.html?style=./description.styl';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGamePerms } from '../../../game/perms/perms';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

@View
@Component({
	components: {
		AppExpand,
		AppFormControlMarkdown,
		AppJolticon,
		AppDashGameWizardControls,
		AppGamePerms,
	},
})
export class FormGameDescription extends BaseForm<DescriptionFormModel> {
	@Prop(Array)
	tags: string[] | null = null;

	modelClass = Game;
	saveMethod = '$saveDescription' as '$saveDescription';

	isFnafDetected = false;
	isDisabled = false;

	$refs!: {
		form: AppForm;
	};

	get hasDetailsPerms() {
		return this.model && this.model.hasPerms('details');
	}

	get shouldShowTags() {
		return (
			this.tags && this.tags.length && this.recommendedTags.length + this.otherTags.length > 0
		);
	}

	get tagText() {
		return (this.formModel.title + ' ' + this.formModel.description_markdown).toLowerCase();
	}

	get recommendedTags() {
		if (this.tags) {
			const text = this.tagText;
			return this.tags
				.map(t => {
					const count = text.split(t.toLowerCase()).length - 1;
					const hashtagCount = text.split('#' + t.toLowerCase()).length - 1;
					return {
						tag: t,
						count: hashtagCount > 0 ? -1 : count,
					};
				})
				.filter(w => w.count > 0)
				.sort((a, b) => {
					if (a.count > b.count) {
						return -1;
					} else if (a.count < b.count) {
						return 1;
					}
					return 0;
				})
				.map(w => w.tag);
		}
		return [];
	}

	get otherTags() {
		if (this.tags) {
			const recommended = this.recommendedTags;
			const text = this.tagText;
			const other = this.tags.filter(
				t =>
					recommended.indexOf(t) === -1 &&
					text.split('#' + t.toLowerCase()).length - 1 === 0
			);
			return other.sort((a, b) => {
				if (a < b) {
					return -1;
				} else if (a > b) {
					return 1;
				}
				return 0;
			});
		}
		return [];
	}

	@Watch('serverErrors')
	onServerErrors() {
		this.isFnafDetected = false;
		this.isDisabled = false;
		if (this.serverErrors['autotag-fnaf']) {
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			this.isFnafDetected = true;
			this.isDisabled = true;
		}
	}

	addTag(tag: string) {
		this.setField('description_markdown', this.formModel.description_markdown + ' #' + tag);
	}

	addAutotag(tag: string) {
		this.setField('autotag', tag);
		this.$refs.form.submit();
	}

	skipAutotag() {
		this.setField('autotag_skip', true);
		this.$refs.form.submit();
	}
}
