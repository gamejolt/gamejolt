<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<form-change-password :requires-old="hasPassword" @submit="hasPassword = true" />
		</div>
	</div>
</template>

<script lang="ts" src="./change-password"></script>
