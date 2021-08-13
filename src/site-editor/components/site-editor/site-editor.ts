import { Options, Vue } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Api } from '../../../_common/api/api.service';
import AppContentBlockEditor from '../../../_common/content-block/editor/editor.vue';
import { showSuccessGrowl } from '../../../_common/growls/growls.service';
import AppLoading from '../../../_common/loading/loading.vue';
import AppThemeSelector from '../../../_common/theme/selector/selector.vue';
import AppThemeEditor from '../../../_common/theme/theme-editor/theme-editor.vue';
import { Store } from '../../store/index';

@Options({
	components: {
		AppLoading,
		AppThemeSelector,
		AppThemeEditor,
		AppContentBlockEditor,
	},
})
export default class AppSiteEditor extends Vue {
	@State tab!: Store['tab'];
	@State site!: Store['site'];
	@State('siteTemplates') templates!: Store['siteTemplates'];
	@State currentTemplateId!: Store['currentTemplateId'];
	@State('siteTheme') theme!: Store['siteTheme'];
	@State isLoaded!: Store['isLoaded'];
	@State isDirty!: Store['isDirty'];

	@Mutation setTemplateId!: Store['setTemplateId'];
	@Mutation setThemeData!: Store['setThemeData'];
	@Mutation setContentEdited!: Store['setContentEdited'];
	@Mutation clearIsDirty!: Store['clearIsDirty'];

	get siteUrl() {
		return this.site.url;
	}

	get confirmMessage() {
		return this.$gettext('You have unsaved changes. Are you sure you want to discard them?');
	}

	mounted() {
		this.$router.beforeEach((_to, _from, next) => {
			if (!this.canLeave()) {
				return next(false);
			}
			this.clearIsDirty();
			next();
		});

		window.onbeforeunload = () => {
			if (this.isDirty) {
				return this.confirmMessage;
			}
		};
	}

	themeEdited(themeData: any) {
		this.setThemeData(themeData);
	}

	contentEdited() {
		this.setContentEdited();
	}

	canLeave() {
		return !this.isDirty || confirm(this.confirmMessage);
	}

	async save() {
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme.data,
			content_blocks: this.site.content_blocks,
		};

		this.clearIsDirty();
		await Api.sendRequest(`/web/dash/sites/editor-save/${this.site.id}`, data, {
			sanitizeComplexData: false,
		});

		showSuccessGrowl(this.$gettext('Your site has been saved.'), this.$gettext('Site Saved'));
	}
}
