<template>
	<div
		ref="container"
		class="content-editor-controls"
		:style="{
			top: this.top,
			left: this.left,
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
			<div v-if="visible">
				<template v-if="Screen.isXs">
					<button
						v-if="capabilities.media"
						type="button"
						class="control-button"
						@click="onClickMedia"
						v-app-tooltip="$gettext('Add an image or GIF')"
					>
						<app-jolticon icon="screenshot" />
					</button>
					<button
						v-if="capabilities.hasAnyEmbed"
						type="button"
						class="control-button"
						@click="onClickEmbed"
						v-app-tooltip="$gettext('Add an embed')"
					>
						<app-jolticon icon="embed" />
					</button>
					<button
						v-if="capabilities.codeBlock"
						type="button"
						class="control-button"
						@click="onClickCodeBlock"
						v-app-tooltip="$gettext('Add a code block')"
					>
						<app-jolticon icon="brackets" />
					</button>
					<button
						v-if="capabilities.blockquote"
						type="button"
						class="control-button"
						@click="onClickBlockquote"
						v-app-tooltip="$gettext('Add a quote')"
					>
						<app-jolticon icon="blockquote" />
					</button>
					<button
						v-if="capabilities.spoiler"
						type="button"
						class="control-button"
						@click="onClickSpoiler"
						v-app-tooltip="$gettext('Add a spoiler')"
					>
						<app-jolticon icon="inactive" />
					</button>
					<button
						v-if="capabilities.hr"
						type="button"
						class="control-button"
						@click="onClickHr"
						v-app-tooltip="$gettext('Add a separator')"
					>
						<app-jolticon icon="hr" />
					</button>
					<button
						v-if="capabilities.list"
						type="button"
						class="control-button"
						@click="onClickBulletList"
						v-app-tooltip="$gettext('Add a bulleted list')"
					>
						<app-jolticon icon="bullet-list" />
					</button>
					<button
						v-if="capabilities.list"
						type="button"
						class="control-button"
						@click="onClickOrderedList"
						v-app-tooltip="$gettext('Add a numbered list')"
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
						<span v-if="!this.collapsed">
							<span class="dot-separator"></span>
							<app-button
								v-if="capabilities.media"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="screenshot"
								@click="onClickMedia"
								v-app-tooltip="$gettext('Add an image or GIF')"
							/>
							<app-button
								v-if="capabilities.hasAnyEmbed"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="embed"
								@click="onClickEmbed"
								v-app-tooltip="$gettext('Add an embed')"
							/>
							<app-button
								v-if="capabilities.codeBlock"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="brackets"
								@click="onClickCodeBlock"
								v-app-tooltip="$gettext('Add a code block')"
							/>
							<app-button
								v-if="capabilities.blockquote"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="blockquote"
								@click="onClickBlockquote"
								v-app-tooltip="$gettext('Add a quote')"
							/>
							<app-button
								v-if="capabilities.spoiler"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="inactive"
								@click="onClickSpoiler"
								v-app-tooltip="$gettext('Add a spoiler')"
							/>
							<app-button
								v-if="capabilities.hr"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="hr"
								@click="onClickHr"
								v-app-tooltip="$gettext('Add a separator')"
							/>
							<app-button
								v-if="capabilities.list"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="bullet-list"
								@click="onClickBulletList"
								v-app-tooltip="$gettext('Add a bulleted list')"
							/>
							<app-button
								v-if="capabilities.list"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="numbered-list"
								@click="onClickOrderedList"
								v-app-tooltip="$gettext('Add a numbered list')"
							/>
						</span>
					</transition>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>

<script lang="ts" src="./controls"></script>
