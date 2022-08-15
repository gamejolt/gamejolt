<script lang="ts" setup>
import { ref } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppProgressBar from './AppProgressBar.vue';

const progress = ref(0);
</script>

<template>
	<section id="styleguide-progress-bars" class="section">
		<h1 class="section-header">Progress Bars</h1>

		<AppProgressBar :percent="30" />

		<h3>Thin</h3>

		<AppProgressBar :percent="30" thin />

		<h3>Glow</h3>

		<AppProgressBar :percent="30" glow />

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

		<AppProgressBar :percent="30" indeterminate />
		<AppProgressBar :percent="30" indeterminate thin />

		<h3>Animated Stripes</h3>
		<p>
			You can use the
			<code>active</code>
			prop to animate stripes and indicate an indeterminate state.
		</p>

		<AppProgressBar :percent="100" indeterminate active />
		<AppProgressBar :percent="100" indeterminate active thin />
	</section>
</template>
