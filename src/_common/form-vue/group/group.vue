<template>
	<div
		class="form-group"
		:class="{
			optional,
		}"
	>
		<label class="control-label" :class="labelClasses" :for="`${form.name}-${name}`">
			{{ humanLabel }}
		</label>

		<slot />
	</div>
</template>

<script lang="ts" src="./group"></script>
