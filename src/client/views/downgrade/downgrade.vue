<template>
	<section class="section">
		<div class="container">
			<p class="lead">
				The Client database on your computer is initialized for an older version of the Client.
			</p>
			<p class="lead">
				<strong>
					To be able to use a new version of the Client, you must first install the old version so
					that it can migrate your data properly, and then reinstall the new version.
				</strong>
			</p>
			<p class="lead">This is required so that none of your information is lost!</p>
			<p class="lead" v-if="downloadUrl">
				<a :href="downloadUrl">
					<app-jolticon icon="download-box" />
					Download the old version of the Game Jolt Client.
				</a>
			</p>
		</div>
	</section>
</template>

<script lang="ts" src="./downgrade" />
