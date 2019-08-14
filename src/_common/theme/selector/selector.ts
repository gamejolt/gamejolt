import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import AppJolticon from '../../../jolticon/jolticon.vue';
import { Popper } from '../../popper/popper.service';
import AppPopper from '../../popper/popper.vue';
import { SiteTemplate } from '../../site/template/template-model';

@Component({
	components: {
		AppJolticon,
		AppPopper,
	},
})
export default class AppThemeSelector extends Vue {
	@Prop(Array)
	templates!: SiteTemplate[];

	@Prop(Number)
	currentTemplate!: number;

	current: SiteTemplate | null = null;

	@Watch('currentTemplate')
	onTemplateChange() {
		this.current = this.templates.find(t => t.id === this.currentTemplate) || null;
	}

	created() {
		if (this.currentTemplate) {
			this.onTemplateChange();
		}
	}

	select(id: number) {
		this.$emit('change', id);
		Popper.hideAll();
	}
}
