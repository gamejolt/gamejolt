<script lang="ts" src="./theme"></script>

<template>
	<div class="form-control-theme">
		<app-popper @show="onPopover()">
			<a class="-current">
				<app-theme-bubble :highlight="highlight" :backlight="backlight" active />
			</a>

			<template #popover>
				<div class="-popover">
					<div class="well">
						<nav class="platform-list inline nav-justified">
							<ul>
								<li>
									<a
										:class="{ active: activeTab === 'preset' }"
										@click="activeTab = 'preset'"
									>
										<translate>Theme Preset</translate>
									</a>
								</li>
								<li>
									<a
										:class="{ active: activeTab === 'custom' }"
										@click="activeTab = 'custom'"
									>
										<translate>Custom Color</translate>
									</a>
								</li>
							</ul>
						</nav>

						<div v-if="activeTab === 'preset'" class="-presets">
							<app-loading v-if="presets.length === 0" />
							<template v-else>
								<a
									v-for="preset of presets"
									:key="preset.id"
									v-app-tooltip="preset.name"
									class="-preset"
									@click="selectPreset(preset)"
								>
									<app-theme-bubble
										:highlight="preset.highlight"
										:backlight="preset.backlight"
										:active="isPresetActive(preset)"
									/>
								</a>
							</template>
						</div>
						<div v-else-if="activeTab === 'custom'">
							<picker
								disable-alpha
								:preset-colors="[]"
								:value="customSelection"
								@input="onCustomChange"
							/>
							<br />
						</div>

						<app-button v-if="!!controlVal" block trans @click="clear()">
							<translate>Clear Theme</translate>
						</app-button>
					</div>
				</div>
			</template>
		</app-popper>
	</div>
</template>

<style lang="stylus" src="./theme.styl" scoped></style>
