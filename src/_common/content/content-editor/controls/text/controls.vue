<template>
	<div
		ref="container"
		class="content-editor-text-controls"
		:style="{
			bottom: this.bottom,
			left: this.left,
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
	>
		<transition name="fade">
			<div v-if="visible">
				<button
					v-if="capabilities.textBold && !isInHeading"
					class="control-button"
					@click.prevent="onClickBold"
					:class="{
						'control-button-active': hasMark('strong'),
					}"
					v-app-tooltip="$gettext('Bold (Ctrl+B)')"
				>
					<app-jolticon icon="bold" />
				</button>
				<button
					v-if="capabilities.textItalic"
					class="control-button"
					@click.prevent="onClickItalic"
					:class="{
						'control-button-active': hasMark('em'),
					}"
					v-app-tooltip="$gettext('Italic (Ctrl+I)')"
				>
					<app-jolticon icon="italic" />
				</button>
				<button
					v-if="capabilities.textStrike"
					class="control-button"
					@click.prevent="onClickStrikethrough"
					:class="{
						'control-button-active': hasMark('strike'),
					}"
					v-app-tooltip="$gettext('Strikethrough')"
				>
					<app-jolticon icon="strikethrough" />
				</button>
				<button
					v-if="capabilities.textCode"
					class="control-button"
					@click.prevent="onClickCode"
					:class="{
						'control-button-active': hasMark('code'),
					}"
					v-app-tooltip="$gettext('Code (Ctrl+`)')"
				>
					<app-jolticon icon="brackets" />
				</button>
				<button
					v-if="capabilities.textLink && capabilities.customLink"
					class="control-button"
					@click.prevent="onClickLink"
					:class="{
						'control-button-active': hasMark('link'),
					}"
					v-app-tooltip="$gettext(isAutolink ? 'Autolinked!' : 'Link (Ctrl+K)')"
				>
					<app-jolticon icon="link" />
				</button>

				<template v-if="shouldShowHeading">
					<span class="control-separator" />
					<button
						class="control-button"
						@click.prevent="onClickHeading(1)"
						:class="{
							'control-button-active': headingLevel === 1,
						}"
						v-app-tooltip="$gettext('Heading Level 1')"
					>
						<app-jolticon icon="h1" />
					</button>
					<button
						class="control-button"
						@click.prevent="onClickHeading(2)"
						:class="{
							'control-button-active': headingLevel === 2,
						}"
						v-app-tooltip="$gettext('Heading Level 2')"
					>
						<app-jolticon icon="h2" />
					</button>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
