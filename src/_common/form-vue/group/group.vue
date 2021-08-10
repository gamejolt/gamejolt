<script lang="ts" src="./group"></script>

<template>
	<div
		class="form-group"
		:class="{
			optional,
		}"
	>
		<label class="control-label" :class="labelClasses" :for="`${form.name}-${name}`">
			<slot name="label">{{ humanLabel }}</slot>
		</label>

		<slot />
	</div>
</template>
