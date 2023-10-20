<script lang="ts">
import { nextTick, toRaw, watch } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppColorpicker from '../../colorpicker/AppColorpicker.vue';
import AppLoading from '../../loading/AppLoading.vue';
import { SiteTemplateModel } from '../../site/template/template-model';
import AppThemeEditorFontSelector from './font-selector.vue';
import AppThemeEditorImage from './image.vue';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

@Options({
	components: {
		AppLoading,
		AppThemeEditorFontSelector,
		AppThemeEditorImage,
		AppColorpicker,
	},
})
export default class AppThemeEditor extends Vue {
	@Prop(String) windowId!: string;
	@Prop(Number) template!: number;
	@Prop(Object) theme!: any;
	@Prop(Number) resourceId!: number;

	isLoaded = false;

	selectedGroup: StyleGroup = null as any;
	templateObj: SiteTemplateModel = {} as any;
	definition: any = {};

	@Emit('change')
	emitChange(_theme: any) {}

	async created() {
		const response = await Api.sendRequest(
			'/sites-io/get-template/' + this.template,
			undefined,
			{
				detach: true,
			}
		);

		this.isLoaded = true;

		this.templateObj = new SiteTemplateModel(response.template);
		this.definition = this.templateObj.data;
		this.selectedGroup = this.definition.styleGroups[0];

		// Make sure we update the page with the current theme.
		this.refresh(true);

		watch(
			() => this.theme,
			() => this.refresh(),
			{ deep: true }
		);
	}

	async refresh(initial = false) {
		// Gotta wait for the value to be saved.
		await nextTick();

		const iframe = document.getElementById(this.windowId) as HTMLIFrameElement | undefined;
		if (iframe && iframe.contentWindow) {
			const msg = {
				type: 'theme-update',
				template: toRaw(this.templateObj),
				definition: toRaw(this.definition),
				theme: toRaw(this.theme),
			};

			iframe.contentWindow.postMessage(msg, '*');
		}

		if (!initial) {
			this.emitChange(this.theme);
		}
	}

	updateField(field: string, content?: string) {
		this.theme[field] = content;
		this.refresh();
	}
}
</script>

<template>
	<div class="theme-editor">
		<AppLoading v-if="!isLoaded" />
		<div v-else>
			<p v-if="definition.styleGroups.length > 1">
				<select v-model="selectedGroup" class="form-control">
					<option
						v-for="group of definition.styleGroups"
						:key="group.name"
						:value="group.name"
					>
						{{ group.name }}
					</option>
				</select>
			</p>

			<form novalidate>
				<div
					v-for="section of selectedGroup.sections"
					:key="section.section"
					class="theme-editor-section"
				>
					<h4>{{ section.section }}</h4>

					<div class="theme-editor-definitions fill-offset">
						<div
							v-for="definitionField of section.definitions"
							:key="definitionField"
							class="form-group"
							:class="
								'theme-editor-definition-' +
								definition.definitions[definitionField].type
							"
						>
							<label class="control-label">
								{{ definition.definitions[definitionField].title }}
							</label>

							<!-- Colopicker -->
							<div
								v-if="definition.definitions[definitionField].type === 'color'"
								class="theme-editor-colorpicker"
							>
								<a
									v-if="!!theme[definitionField]"
									style="float: left"
									class="clear-link"
									@click="updateField(definitionField, undefined)"
								>
									<AppTranslate>clear</AppTranslate>
								</a>
								<AppColorpicker v-model="theme[definitionField]" />
							</div>

							<!-- Image -->
							<AppThemeEditorImage
								v-else-if="definition.definitions[definitionField].type === 'image'"
								v-model="theme[definitionField]"
								type="sites-theme-image"
								:parent-id="resourceId"
							/>

							<!-- Font Family -->
							<AppThemeEditorFontSelector
								v-else-if="
									definition.definitions[definitionField].type === 'fontFamily'
								"
								v-model="theme[definitionField]"
								class="theme-editor-font-family"
							/>

							<!-- Dropdown -->
							<div
								v-else-if="
									definition.definitions[definitionField].type === 'dropdown'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option
										v-for="option of definition.definitions[definitionField]
											.options"
										:key="option"
										:value="option"
									>
										{{ option }}
									</option>
								</select>
							</div>

							<!-- Background Repeat -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundRepeat'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										<AppTranslate>Repeat</AppTranslate>
									</option>
									<option value="repeat-x">
										<AppTranslate>Repeat Horizontal</AppTranslate>
									</option>
									<option value="repeat-y">
										<AppTranslate>Repeat Vertical</AppTranslate>
									</option>
									<option value="no-repeat">
										<AppTranslate>Don't Repeat</AppTranslate>
									</option>
								</select>
							</div>

							<!-- Background Size -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundSize'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										<AppTranslate>Auto (Default)</AppTranslate>
									</option>
									<option value="cover">
										<AppTranslate>Cover</AppTranslate>
									</option>
									<option value="contain">
										<AppTranslate>Contain</AppTranslate>
									</option>
								</select>
							</div>

							<!-- Background Position -->
							<div
								v-else-if="
									definition.definitions[definitionField].type ===
									'backgroundPosition'
								"
								class="theme-editor-dropdown"
							>
								<select v-model="theme[definitionField]" class="form-control">
									<option :value="undefined">
										<AppTranslate>Top</AppTranslate>
									</option>
									<option value="topLeft">
										<AppTranslate>Top Left</AppTranslate>
									</option>
									<option value="right">
										<AppTranslate>Right</AppTranslate>
									</option>
									<option value="topRight">
										<AppTranslate>Top Right</AppTranslate>
									</option>
									<option value="bottomRight">
										<AppTranslate>Bottom Right</AppTranslate>
									</option>
									<option value="bottom">
										<AppTranslate>Bottom</AppTranslate>
									</option>
									<option value="bottomLeft">
										<AppTranslate>Bottom Left</AppTranslate>
									</option>
									<option value="left"><AppTranslate>Left</AppTranslate></option>
									<option value="center">
										<AppTranslate>Center</AppTranslate>
									</option>
								</select>
							</div>

							<!-- CSS Input -->
							<div
								v-else-if="definition.definitions[definitionField].type === 'css'"
								class="theme-editor-code"
							>
								<textarea
									v-model="theme[definitionField]"
									class="form-control"
									rows="15"
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<style lang="stylus" src="./theme-editor.styl" scoped></style>
