<template>
	<section class="section" id="styleguide-jolticons">
		<h1 class="section-header">Jolticons</h1>

		<p>
			Add a jolticon by making a
			<code>span</code>
			element with a
			<code>.jolticon</code>
			class and the identifier of your choice.
		</p>

		<input
			type="text"
			class="form-control"
			style="width: 100%; margin-bottom: 1em; padding: 5px;"
			placeholder="Search for a Jolticon..."
			v-model="filter"
		/>

		<div class="row">
			<div class="col-xs-2 text-center" v-for="jolticon of filteredIcons" :key="jolticon">
				<p v-app-tooltip="jolticon">
					<app-jolticon :icon="jolticon" big />
				</p>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./jolticons-styleguide"></script>
