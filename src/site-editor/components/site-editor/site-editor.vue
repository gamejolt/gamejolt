<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import AppContentBlockEditor from '../../../_common/content-block/editor/AppContentBlockEditor.vue';
import { showSuccessGrowl } from '../../../_common/growls/growls.service';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import AppThemeSelector from '../../../_common/theme/selector/selector.vue';
import AppThemeEditor from '../../../_common/theme/theme-editor/theme-editor.vue';
import { useSiteEditorStore } from '../../store/index';

@Options({
	components: {
		AppLoading,
		AppThemeSelector,
		AppThemeEditor,
		AppContentBlockEditor,
	},
})
export default class AppSiteEditor extends Vue {
	store = setup(() => useSiteEditorStore());

	get tab() {
		return this.store.tab;
	}

	get site() {
		return this.store.site;
	}

	get templates() {
		return this.store.siteTemplates;
	}

	get currentTemplateId() {
		return this.store.currentTemplateId;
	}

	get theme() {
		return this.store.siteTheme;
	}

	get isLoaded() {
		return this.store.isLoaded;
	}

	get isDirty() {
		return this.store.isDirty;
	}

	get siteUrl() {
		return this.site?.url;
	}

	get confirmMessage() {
		return this.$gettext('You have unsaved changes. Are you sure you want to discard them?');
	}

	mounted() {
		this.$router.beforeEach((_to, _from, next) => {
			if (!this.canLeave()) {
				return next(false);
			}
			this.store.clearIsDirty();
			next();
		});

		window.onbeforeunload = () => {
			if (this.isDirty) {
				return this.confirmMessage;
			}
		};
	}

	themeEdited(themeData: any) {
		this.store.setThemeData(themeData);
	}

	contentEdited() {
		this.store.setContentEdited();
	}

	canLeave() {
		return !this.isDirty || confirm(this.confirmMessage);
	}

	async save() {
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme!.data,
			content_blocks: this.site!.content_blocks,
		};

		this.store.clearIsDirty();
		await Api.sendRequest(`/web/dash/sites/editor-save/${this.site!.id}`, data, {
			sanitizeComplexData: false,
		});

		showSuccessGrowl(this.$gettext('Your site has been saved.'), this.$gettext('Site Saved'));
	}
}
</script>

<template>
	<div class="site-editor fill-darkest" :class="'site-editor-tab-' + tab">
		<div class="site-editor-body">
			<AppLoading v-if="!isLoaded" />
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
										<AppTranslate>Customize Theme</AppTranslate>
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
										<AppTranslate>Edit Content</AppTranslate>
									</router-link>
								</li>
							</ul>
						</div>

						<div class="navbar-center" />

						<div class="navbar-right">
							<div class="navbar-controls">
								<AppButton primary solid @click="save()">
									<AppTranslate>Save</AppTranslate>
								</AppButton>
							</div>
						</div>
					</nav>
				</div>

				<div
					v-if="tab === 'theme'"
					class="site-editor-sidebar fill-dark scrollable anim-fade-enter-left anim-fade-leave-left"
				>
					<div class="well">
						<h3 class="sans-margin-top">
							<AppTranslate>Choose a Theme</AppTranslate>
						</h3>

						<p class="small text-muted">
							<AppTranslate>
								Themes decide the layout and general styling of your site.
							</AppTranslate>
						</p>

						<AppThemeSelector
							:templates="templates"
							:current-template="currentTemplateId"
							@change="store.setTemplateId($event)"
						/>

						<template v-if="!!currentTemplateId">
							<div v-for="templateId of [currentTemplateId]" :key="templateId">
								<AppThemeEditor
									window-id="site-editor-iframe"
									:resource-id="site?.id"
									:template="templateId"
									:theme="theme?.data"
									@change="themeEdited"
								/>
							</div>
						</template>
					</div>
				</div>
				<div
					v-if="tab === 'content'"
					class="site-editor-bottom fill-dark scrollable anim-fade-enter-up anim-fade-leave-down"
				>
					<div class="well">
						<AppContentBlockEditor
							window-id="site-editor-iframe"
							:site="site"
							:content-block="site?.content_blocks?.[0]"
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

<style lang="stylus" scoped>
.site-editor
	height: 100vh
	width: 100%
	overflow: hidden
	background-color: transparent

	&-nav
		position: absolute
		top: 0
		left: 0
		right: 0

	&-sidebar
	&-content
		position: absolute
		top: $navbar-height
		bottom: 0

	&-sidebar
		left: 0
		width: 350px

	&-bottom
		position: absolute
		bottom: 0
		left: 0
		right: 0
		height: 40%
		overflow-y: auto
		z-index: 2

	&-content
		right: 0
		left: 0

		.site-editor-tab-theme &
			left: 350px

		.site-editor-tab-content &
			bottom: 40%

		iframe
			display: block
			width: 100%
			height: 100%
			border: 0
</style>
