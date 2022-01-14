<script lang="ts">
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
</script>

<template>
	<div class="site-editor fill-darkest" :class="'site-editor-tab-' + tab">
		<div class="site-editor-body">
			<app-loading v-if="!isLoaded" />
			<div v-else>
				<div class="site-editor-nav">
					<nav class="navbar">
						<div class="navbar-left">
							<ul class="navbar-items">
								<li>
									<router-link
										replace
										:to="{
											name: 'editor',
											params: { tab: 'theme' },
											query: $route.query,
										}"
										active-class="active"
									>
										<translate>Customize Theme</translate>
									</router-link>
								</li>
								<li>
									<router-link
										replace
										:to="{
											name: 'editor',
											params: { tab: 'content' },
											query: $route.query,
										}"
										active-class="active"
									>
										<translate>Edit Content</translate>
									</router-link>
								</li>
							</ul>
						</div>

						<div class="navbar-center" />

						<div class="navbar-right">
							<div class="navbar-controls">
								<app-button primary solid @click="save()">
									<translate>Save</translate>
								</app-button>
							</div>
						</div>
					</nav>
				</div>

				<div
					v-if="tab === 'theme'"
					class="
						site-editor-sidebar
						fill-dark
						scrollable
						anim-fade-enter-left anim-fade-leave-left
					"
				>
					<div class="well">
						<h3 class="sans-margin-top">
							<translate>Choose a Theme</translate>
						</h3>

						<p class="small text-muted">
							<translate>
								Themes decide the layout and general styling of your site.
							</translate>
						</p>

						<app-theme-selector
							:templates="templates"
							:current-template="currentTemplateId"
							@change="setTemplateId($event)"
						/>

						<template v-if="!!currentTemplateId">
							<div v-for="templateId of [currentTemplateId]" :key="templateId">
								<app-theme-editor
									window-id="site-editor-iframe"
									:resource-id="site.id"
									:template="templateId"
									:theme="theme.data"
									@change="themeEdited"
								/>
							</div>
						</template>
					</div>
				</div>
				<div
					v-if="tab === 'content'"
					class="
						site-editor-bottom
						fill-dark
						scrollable
						anim-fade-enter-up anim-fade-leave-down
					"
				>
					<div class="well">
						<app-content-block-editor
							window-id="site-editor-iframe"
							:site="site"
							:content-block="site.content_blocks[0]"
							@change="contentEdited"
						/>
					</div>
				</div>

				<div class="site-editor-content">
					<iframe id="site-editor-iframe" :src="siteUrl" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./site-editor.styl" scoped></style>
