<template>
	<div>
		<app-theme-editor-font-selector-style-injector :font-definitions="fontDefinitions" />

		<div class="font-selector" :class="{ 'is-open': isSelectorShowing }">
			<div class="font-selector-selected" @click="toggleSelector()">
				<span class="font-selector-cancel" v-if="isSelectorShowing">
					<translate>cancel</translate>
				</span>

				<a
					class="font-selector-clear"
					v-if="!isSelectorShowing && selectedFont"
					@click="clearSelectedFont()"
				>
					<translate>clear</translate>
				</a>

				<div class="font-selector-selected-label" v-if="!selectedFont">
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

			<div class="font-selector-filter" v-if="isSelectorShowing">
				<input
					type="text"
					class="form-control"
					v-model="fontListFilter"
					ng-change="updateFontDefinitions()"
					:placeholder="$gettext(`Filter fonts`)"
				/>
			</div>

			<ul class="font-selector-font-list" v-if="isSelectorShowing" ref="list">
				<li
					class="font-selector-font-list-item"
					v-for="font of fontListFiltered"
					:key="font.family"
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
@require '~styles/variables'
@require '~styles-lib/mixins'

.font-selector
	&-font-list
		margin: 0
		padding: 0
		height: 300px
		overflow-y: auto
		overflow-x: hidden

	&-font-list-item, &-selected
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

<script lang="ts" src="./font-selector"></script>
