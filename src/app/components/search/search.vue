<template>
	<div class="app-search">
		<app-shortkey shortkey="s" @press="focus" />

		<app-jolticon class="-icon" icon="search" />

		<!--
			Put the action/method stuff so that crawlers can see how to submit the form.
		-->
		<form
			class="search-input-form navbar-form"
			action="/search"
			method="GET"
			role="search"
			onsubmit="return false"
		>
			<div class="form-group">
				<label :for="`search-input-${id}`" class="sr-only">
					<translate>search.input.placeholder</translate>
				</label>

				<div class="navbar-form-control" :class="{ active: isFocused }">
					<!--
						We use the 'click-show' trigger event.
						This will make sure that the autocomplete popover doesn't disappear when
						clicking the search input again.'
					-->
					<app-popper
						trigger="manual"
						block
						hide-on-state-change
						track-trigger-width
						:show="isShowingAutocomplete"
						:disabled="autocompleteDisabled"
						:auto-hide="false"
					>
						<app-search-input
							:id="`search-input-${id}`"
							v-model="query"
							@focus="onFocus"
							@blur="onBlur"
							@keydown="onKeydown"
						/>

						<app-search-autocomplete slot="popover" />
					</app-popper>
				</div>
			</div>
		</form>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.app-search
	position: relative

.-icon
	display: block
	position: absolute
	left: 5px
	top: 16px
	user-select: none
	color: $dark-theme-fg-muted
	z-index: 2
</style>

<script lang="ts" src="./search"></script>
