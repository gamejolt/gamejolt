<template>
	<div>
		<h4>
			<translate>What did you think?</translate>
		</h4>

		<p>{{ game.title }}</p>

		<div>
			<app-rating-widget :game="game" />
		</div>

		<br />

		<p>
			<em>
				<translate>Rating the games you play helps us show you better stuff.</translate>
			</em>
		</p>
	</div>
</template>

<script lang="ts" src="./rating-growl"></script>
