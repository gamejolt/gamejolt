<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { Jolticons } from '../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppJolticonsStyleguide extends Vue {
	filter = '';

	get filteredIcons() {
		return [...Jolticons].sort().filter(i => i.indexOf(this.filter) !== -1);
	}
}
</script>

<template>
	<section id="styleguide-jolticons" class="section">
		<h1 class="section-header">Jolticons</h1>

		<p>
			Add a jolticon by making a
			<code>span</code>
			element with a
			<code>.jolticon</code>
			class and the identifier of your choice.
		</p>

		<input
			v-model="filter"
			type="text"
			class="form-control"
			style="width: 100%; margin-bottom: 1em; padding: 5px"
			placeholder="Search for a Jolticon..."
		/>

		<div class="row">
			<div v-for="jolticon of filteredIcons" :key="jolticon" class="col-xs-2 text-center">
				<p v-app-tooltip="jolticon">
					<AppJolticon :icon="jolticon" big />
				</p>
			</div>
		</div>
	</section>
</template>
