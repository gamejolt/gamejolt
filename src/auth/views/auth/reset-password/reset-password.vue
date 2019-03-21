<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<translate>auth.reset_password.heading</translate>
		</h2>

		<form-reset-password :user-id="userId" :token="token" @submit="onSubmitted" />
	</div>
</template>

<script lang="ts" src="./reset-password" />
