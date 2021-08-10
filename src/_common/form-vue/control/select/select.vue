<script lang="ts" src="./select"></script>

<template>
	<!--
	The click.stop is because selects in modals end up closing the modal when
	selecting an option. The click event triggers as being outside the modal.
	There doesn't seem to be a harm in just not propagating the event always
	since nothing ever needs to hook into it so far.
	-->
	<select
		:id="id"
		v-validate="{ rules: validationRules }"
		:name="group.name"
		class="form-control"
		:value="controlVal"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
		@click.stop
		@change="onChange($event.target.value)"
	>
		<slot />
	</select>
</template>
