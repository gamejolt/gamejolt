<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppProgressBar from './bar.vue';

@Options({
	components: {
		AppProgressBar,
	},
})
export default class AppProgressBarStyleguide extends Vue {
	progress = 0;
}
</script>

<template>
	<section class="section" id="styleguide-progress-bars">
		<h1 class="section-header">Progress Bars</h1>

		<AppProgressBar :percent="30" />

		<h3>Thin</h3>

		<AppProgressBar :percent="30" :thin="true" />

		<h3>Content Inside</h3>
		<p>You can put content inside progress bars.</p>

		<AppProgressBar :percent="30">30%</AppProgressBar>

		<h3>Animated Progress</h3>
		<p>Progress bars will automatically animate as they fill up.</p>

		<AppProgressBar :percent="progress">{{ progress }}%</AppProgressBar>

		<AppButton @click="progress = progress + 10 > 100 ? 0 : progress + 10">
			Increase Progress
		</AppButton>

		<h3>Striped</h3>

		<AppProgressBar :percent="30" :indeterminate="true" />
		<AppProgressBar :percent="30" :indeterminate="true" :thin="true" />

		<h3>Animated Stripes</h3>
		<p>
			You can use the
			<code>active</code>
			prop to animate stripes and indicate an indeterminate state.
		</p>

		<AppProgressBar :percent="100" :indeterminate="true" :active="true" />
		<AppProgressBar :percent="100" :indeterminate="true" :active="true" :thin="true" />
	</section>
</template>
