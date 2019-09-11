<template>
	<div class="control-errors">
		<p
			v-if="!!error"
			class="help-block error anim-fade-in"
			:class="{
				'hide-caret': hideCaret,
				above: position === 'above',
			}"
		>
			{{ error }}
		</p>

		<slot style="display: none" />
	</div>
</template>

<script lang="ts" src="./control-errors"></script>
