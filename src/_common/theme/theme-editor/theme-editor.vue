<script lang="ts" src="./theme-editor"></script>

<template>
	<div class="theme-editor">
		<app-loading v-if="!isLoaded" />
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
									<translate>clear</translate>
								</a>
								<app-colorpicker
									v-model="theme[definitionField]"
									@input="refresh()"
								/>
							</div>

							<!-- Image -->
							<app-theme-editor-image
								v-else-if="definition.definitions[definitionField].type === 'image'"
								v-model="theme[definitionField]"
								type="sites-theme-image"
								:parent-id="resourceId"
								@input="refresh()"
							/>

							<!-- Font Family -->
							<app-theme-editor-font-selector
								v-else-if="
									definition.definitions[definitionField].type === 'fontFamily'
								"
								v-model="theme[definitionField]"
								class="theme-editor-font-family"
								@input="refresh()"
							/>

							<!-- Dropdown -->
							<div
								v-else-if="
									definition.definitions[definitionField].type === 'dropdown'
								"
								class="theme-editor-dropdown"
							>
								<select
									v-model="theme[definitionField]"
									class="form-control"
									@input="refresh()"
								>
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
								<select
									v-model="theme[definitionField]"
									class="form-control"
									@input="refresh()"
								>
									<option :value="undefined">
										<translate>Repeat</translate>
									</option>
									<option value="repeat-x">
										<translate>Repeat Horizontal</translate>
									</option>
									<option value="repeat-y">
										<translate>Repeat Vertical</translate>
									</option>
									<option value="no-repeat">
										<translate>Don't Repeat</translate>
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
								<select
									v-model="theme[definitionField]"
									class="form-control"
									@input="refresh()"
								>
									<option :value="undefined">
										<translate>Auto (Default)</translate>
									</option>
									<option value="cover"><translate>Cover</translate></option>
									<option value="contain"><translate>Contain</translate></option>
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
								<select
									v-model="theme[definitionField]"
									class="form-control"
									@input="refresh()"
								>
									<option :value="undefined"><translate>Top</translate></option>
									<option value="topLeft"><translate>Top Left</translate></option>
									<option value="right"><translate>Right</translate></option>
									<option value="topRight">
										<translate>Top Right</translate>
									</option>
									<option value="bottomRight">
										<translate>Bottom Right</translate>
									</option>
									<option value="bottom"><translate>Bottom</translate></option>
									<option value="bottomLeft">
										<translate>Bottom Left</translate>
									</option>
									<option value="left"><translate>Left</translate></option>
									<option value="center"><translate>Center</translate></option>
								</select>
							</div>

							<!-- CSS Input -->
							<div
								v-else-if="definition.definitions[definitionField].type === 'css'"
								class="theme-editor-code"
							>
								<app-codemirror
									:value="theme[definitionField]"
									:options="{
										mode: 'css',
										lineNumbers: false,
										tabSize: 2,
									}"
									@change="updateField(definitionField, $event)"
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
