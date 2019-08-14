<template>
	<section class="section" id="styleguide-progress-bars">
		<h1 class="section-header">Progress Bars</h1>

		<app-progress-bar :percent="30" />

		<h3>Thin</h3>

		<app-progress-bar :percent="30" :thin="true" />

		<h3>Content Inside</h3>
		<p>You can put content inside progress bars.</p>

		<app-progress-bar :percent="30">30%</app-progress-bar>

		<h3>Animated Progress</h3>
		<p>Progress bars will automatically animate as they fill up.</p>

		<app-progress-bar :percent="progress">{{ progress }}%</app-progress-bar>

		<app-button @click="progress = progress + 10 > 100 ? 0 : progress + 10">
			Increase Progress
		</app-button>

		<h3>Striped</h3>

		<app-progress-bar :percent="30" :indeterminate="true" />
		<app-progress-bar :percent="30" :indeterminate="true" :thin="true" />

		<h3>Animated Stripes</h3>
		<p>
			You can use the
			<code>active</code>
			prop to animate stripes and indicate an indeterminate state.
		</p>

		<app-progress-bar :percent="100" :indeterminate="true" :active="true" />
		<app-progress-bar :percent="100" :indeterminate="true" :active="true" :thin="true" />
	</section>
</template>

<script lang="ts" src="./bar-styleguide"></script>
