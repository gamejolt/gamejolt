<script lang="ts" src="./forgot"></script>

<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<translate>Trouble logging in?</translate>
		</h2>

		<form-retrieve-login @submit="onSubmitted" />
	</div>
</template>
