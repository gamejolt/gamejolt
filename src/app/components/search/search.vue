<template>
	<div class="app-search">
		<app-shortkey shortkey="s" @press="focus" />

		<!--
			Put the action/method stuff so that crawlers can see how to submit the form.
		-->
		<form class="navbar-form" action="/search" method="GET" role="search" onsubmit="return false">
			<div class="-input">
				<label :for="`search-input-${id}`" class="sr-only">
					<translate>search.input.placeholder</translate>
				</label>

				<!--
					We use the 'click-show' trigger event.
					This will make sure that the autocomplete popover doesn't disappear when
					clicking the search input again.'
				-->
				<app-popper
					content-class="fill-darkest"
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
						ref="searchInput"
						v-model="query"
						@focus="onFocus"
						@blur="onBlur"
						@keydown="onKeydown"
					/>

					<app-search-autocomplete slot="popover" />
				</app-popper>
			</div>
		</form>
	</div>
</template>

<style lang="stylus" scoped>
.-input
	width: 100%
</style>

<script lang="ts" src="./search"></script>
