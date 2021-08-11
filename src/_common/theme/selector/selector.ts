import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Popper } from '../../popper/popper.service';
import AppPopper from '../../popper/popper.vue';
import { SiteTemplate } from '../../site/template/template-model';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppThemeSelector extends Vue {
	@Prop(Array)
	templates!: SiteTemplate[];

	@Prop(Number)
	currentTemplate!: number;

	current: SiteTemplate | null = null;

	@Emit('change')
	emitChange(_id: number) {}

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
		this.emitChange(id);
		Popper.hideAll();
	}
}
