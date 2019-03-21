<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<translate>auth.forgot.heading</translate>
		</h2>

		<form-retrieve-login @submit="onSubmitted"></form-retrieve-login>
	</div>
</template>

<script lang="ts" src="./forgot" />
