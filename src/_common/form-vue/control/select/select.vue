<template>
	<!--
	The click.stop is because selects in modals end up closing the modal when
	selecting an option. The click event triggers as being outside the modal.
	There doesn't seem to be a harm in just not propagating the event always
	since nothing ever needs to hook into it so far.
-->
	<select
		:id="id"
		:name="group.name"
		class="form-control"
		:value="controlVal"
		@click.stop
		@change="onChange($event.target.value)"
		v-validate="{ rules: validationRules }"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
	>
		<slot />
	</select>
</template>

<script lang="ts" src="./select"></script>
