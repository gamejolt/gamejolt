<script lang="ts" src="./font-selector"></script>

<template>
	<div>
		<app-theme-editor-font-selector-style-injector :font-definitions="fontDefinitions" />

		<div class="font-selector" :class="{ 'is-open': isSelectorShowing }">
			<div class="font-selector-selected" @click="toggleSelector()">
				<span v-if="isSelectorShowing" class="font-selector-cancel">
					<translate>cancel</translate>
				</span>

				<a
					v-if="!isSelectorShowing && selectedFont"
					class="font-selector-clear"
					@click="clearSelectedFont()"
				>
					<translate>clear</translate>
				</a>

				<div v-if="!selectedFont" class="font-selector-selected-label">
					<translate>Choose a font...</translate>
				</div>
				<div
					v-else
					class="font-selector-selected-label"
					:style="{ 'font-family': `'${selectedFont.family}::Selector'` }"
				>
					{{ selectedFont.family }}
				</div>
			</div>

			<div v-if="isSelectorShowing" class="font-selector-filter">
				<input
					v-model="fontListFilter"
					type="text"
					class="form-control"
					ng-change="updateFontDefinitions()"
					:placeholder="$gettext(`Filter fonts`)"
				/>
			</div>

			<ul v-if="isSelectorShowing" ref="list" class="font-selector-font-list">
				<li
					v-for="font of fontListFiltered"
					:key="font.family"
					class="font-selector-font-list-item"
					:style="{ 'font-family': `'${font.family}::Selector'` }"
					@click="selectFont(font)"
				>
					{{ font.family }}
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.font-selector
	&-font-list
		margin: 0
		padding: 0
		height: 300px
		overflow-y: auto
		overflow-x: hidden

	&-font-list-item
	&-selected
		margin: 0
		padding: 8px 15px
		list-style: none
		cursor: pointer

		&:hover
			change-bg('bg-subtle')
			border-bottom-left-radius: $border-radius-large
			border-bottom-right-radius: $border-radius-large

			.font-selector-cancel
				theme-prop('color', 'link-hover')

	&-cancel
		theme-prop('color', 'fg-muted')
		float: right

	&-clear
		theme-prop('color', 'fg-muted', true)
		float: right

		&:hover
			theme-prop('color', 'link-hover', true)

	&-filter
		change-bg('bg-subtle')
		padding: 10px 15px
</style>
