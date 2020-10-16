<script lang="ts" src="./player-styleguide"></script>

<template>
	<section id="styleguide-video-player" class="section">
		<h1 class="section-header">Video Player</h1>

		<app-video-player
			poster="https://m.gjcdn.net/fireside-post-image/1300/4180951-ll-krxqej8j-v4.webp"
			manifest="https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd"
		/>

		<!-- <app-progress-bar :percent="30" />

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
		<app-progress-bar :percent="100" :indeterminate="true" :active="true" :thin="true" /> -->
	</section>
</template>
