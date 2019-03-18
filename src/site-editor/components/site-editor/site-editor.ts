import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppContentBlockEditor from 'game-jolt-frontend-lib/components/content-block/editor/editor.vue';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import AppThemeSelector from 'game-jolt-frontend-lib/components/theme/selector/selector.vue';
import AppThemeEditor from 'game-jolt-frontend-lib/components/theme/theme-editor/theme-editor.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { Store } from '../../store/index';

@Component({
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

		Growls.success(this.$gettext('Your site has been saved.'), this.$gettext('Site Saved'));
	}
}
