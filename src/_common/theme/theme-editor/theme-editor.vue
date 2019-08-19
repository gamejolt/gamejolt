<template>
	<div class="theme-editor">
		<app-loading v-if="!isLoaded" />
		<div v-else>
			<p v-if="definition.styleGroups.length > 1">
				<select class="form-control" v-model="selectedGroup">
					<option v-for="group of definition.styleGroups" :value="group.name">
						{{ group.name }}
					</option>
				</select>
			</p>

			<form novalidate>
				<div class="theme-editor-section" v-for="section of selectedGroup.sections">
					<h4>{{ section.section }}</h4>

					<div class="theme-editor-definitions fill-offset">
						<div
							class="form-group"
							v-for="definitionField of section.definitions"
							:class="'theme-editor-definition-' + definition.definitions[definitionField].type"
						>
							<label class="control-label">
								{{ definition.definitions[definitionField].title }}
							</label>

							<!-- Colopicker -->
							<div
								class="theme-editor-colorpicker"
								v-if="definition.definitions[definitionField].type === 'color'"
							>
								<a
									style="float: left"
									class="clear-link"
									v-if="!!theme[definitionField]"
									@click="updateField(definitionField, undefined)"
								>
									<translate>clear</translate>
								</a>
								<app-colorpicker v-model="theme[definitionField]" @input="refresh()" />
							</div>

							<!-- Image -->
							<app-theme-editor-image
								v-else-if="definition.definitions[definitionField].type === 'image'"
								type="sites-theme-image"
								:parent-id="resourceId"
								v-model="theme[definitionField]"
								@input="refresh()"
							/>

							<!-- Font Family -->
							<app-theme-editor-font-selector
								v-else-if="definition.definitions[definitionField].type === 'fontFamily'"
								class="theme-editor-font-family"
								v-model="theme[definitionField]"
								@input="refresh()"
							/>

							<!-- Dropdown -->
							<div
								class="theme-editor-dropdown"
								v-else-if="definition.definitions[definitionField].type === 'dropdown'"
							>
								<select class="form-control" v-model="theme[definitionField]" @input="refresh()">
									<option
										v-for="option of definition.definitions[definitionField].options"
										:value="option"
									>
										{{ option }}
									</option>
								</select>
							</div>

							<!-- Background Repeat -->
							<div
								class="theme-editor-dropdown"
								v-else-if="definition.definitions[definitionField].type === 'backgroundRepeat'"
							>
								<select class="form-control" v-model="theme[definitionField]" @input="refresh()">
									<option :value="undefined"><translate>Repeat</translate></option>
									<option value="repeat-x"><translate>Repeat Horizontal</translate></option>
									<option value="repeat-y"><translate>Repeat Vertical</translate></option>
									<option value="no-repeat"><translate>Don't Repeat</translate></option>
								</select>
							</div>

							<!-- Background Size -->
							<div
								class="theme-editor-dropdown"
								v-else-if="definition.definitions[definitionField].type === 'backgroundSize'"
							>
								<select class="form-control" v-model="theme[definitionField]" @input="refresh()">
									<option :value="undefined"><translate>Auto (Default)</translate></option>
									<option value="cover"><translate>Cover</translate></option>
									<option value="contain"><translate>Contain</translate></option>
								</select>
							</div>

							<!-- Background Position -->
							<div
								class="theme-editor-dropdown"
								v-else-if="definition.definitions[definitionField].type === 'backgroundPosition'"
							>
								<select class="form-control" v-model="theme[definitionField]" @input="refresh()">
									<option :value="undefined"><translate>Top</translate></option>
									<option value="topLeft"><translate>Top Left</translate></option>
									<option value="right"><translate>Right</translate></option>
									<option value="topRight"><translate>Top Right</translate></option>
									<option value="bottomRight"><translate>Bottom Right</translate></option>
									<option value="bottom"><translate>Bottom</translate></option>
									<option value="bottomLeft"><translate>Bottom Left</translate></option>
									<option value="left"><translate>Left</translate></option>
									<option value="center"><translate>Center</translate></option>
								</select>
							</div>

							<!-- CSS Input -->
							<div
								class="theme-editor-code"
								v-else-if="definition.definitions[definitionField].type === 'css'"
							>
								<app-codemirror
									:value="theme[definitionField]"
									:options="{
										mode: 'css',
										lineNumbers: false,
										tabSize: 2,
									}"
									@input="updateField(definitionField, $event)"
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

<script lang="ts" src="./theme-editor"></script>
