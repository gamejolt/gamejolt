<script lang="ts" src="./controls"></script>

<template>
	<div
		ref="container"
		class="content-editor-controls"
		:style="{
			top: top + 'px',
			left: left + 'px',
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
		tabindex="0"
	>
		<!-- ^ Tab index is 0 so that the main content editor does not focus when clicking the buttons -->
		<!-- When adding new buttons here, make sure they are added in both mobile and desktop views -->
		<transition name="fade">
			<div v-if="shouldShow">
				<template v-if="Screen.isXs">
					<button
						v-if="capabilities.media"
						v-app-tooltip="$gettext('Add an image or GIF')"
						type="button"
						class="control-button"
						@click="onClickMedia"
					>
						<app-jolticon icon="screenshot" />
					</button>
					<button
						v-if="capabilities.hasAnyEmbed"
						v-app-tooltip="$gettext('Add an embed')"
						type="button"
						class="control-button"
						@click="onClickEmbed"
					>
						<app-jolticon icon="embed" />
					</button>
					<button
						v-if="capabilities.codeBlock"
						v-app-tooltip="$gettext('Add a code block')"
						type="button"
						class="control-button"
						@click="onClickCodeBlock"
					>
						<app-jolticon icon="brackets" />
					</button>
					<button
						v-if="capabilities.blockquote"
						v-app-tooltip="$gettext('Add a quote')"
						type="button"
						class="control-button"
						@click="onClickBlockquote"
					>
						<app-jolticon icon="blockquote" />
					</button>
					<button
						v-if="capabilities.spoiler"
						v-app-tooltip="$gettext('Add a spoiler')"
						type="button"
						class="control-button"
						@click="onClickSpoiler"
					>
						<app-jolticon icon="inactive" />
					</button>
					<button
						v-if="capabilities.hr"
						v-app-tooltip="$gettext('Add a separator')"
						type="button"
						class="control-button"
						@click="onClickHr"
					>
						<app-jolticon icon="hr" />
					</button>
					<button
						v-if="capabilities.list"
						v-app-tooltip="$gettext('Add a bulleted list')"
						type="button"
						class="control-button"
						@click="onClickBulletList"
					>
						<app-jolticon icon="bullet-list" />
					</button>
					<button
						v-if="capabilities.list"
						v-app-tooltip="$gettext('Add a numbered list')"
						type="button"
						class="control-button"
						@click="onClickOrderedList"
					>
						<app-jolticon icon="numbered-list" />
					</button>
				</template>
				<template v-else>
					<app-button
						class="-add-button"
						:class="{
							'-add-button-rotated': !collapsed,
						}"
						circle
						solid
						:icon="'add'"
						@click="onClickExpand"
					/>
					<transition name="fade">
						<span v-if="!collapsed">
							<span class="dot-separator" />
							<app-button
								v-if="capabilities.media"
								v-app-tooltip="$gettext('Add an image or GIF')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="screenshot"
								@click="onClickMedia"
							/>
							<app-button
								v-if="capabilities.hasAnyEmbed"
								v-app-tooltip="$gettext('Add an embed')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="embed"
								@click="onClickEmbed"
							/>
							<app-button
								v-if="capabilities.codeBlock"
								v-app-tooltip="$gettext('Add a code block')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="brackets"
								@click="onClickCodeBlock"
							/>
							<app-button
								v-if="capabilities.blockquote"
								v-app-tooltip="$gettext('Add a quote')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="blockquote"
								@click="onClickBlockquote"
							/>
							<app-button
								v-if="capabilities.spoiler"
								v-app-tooltip="$gettext('Add a spoiler')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="inactive"
								@click="onClickSpoiler"
							/>
							<app-button
								v-if="capabilities.hr"
								v-app-tooltip="$gettext('Add a separator')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="hr"
								@click="onClickHr"
							/>
							<app-button
								v-if="capabilities.list"
								v-app-tooltip="$gettext('Add a bulleted list')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="bullet-list"
								@click="onClickBulletList"
							/>
							<app-button
								v-if="capabilities.list"
								v-app-tooltip="$gettext('Add a numbered list')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="numbered-list"
								@click="onClickOrderedList"
							/>
						</span>
					</transition>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>
