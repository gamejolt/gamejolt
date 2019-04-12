<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<form-profile :model="app.user" @submit="onProfileSaved" />
		</div>
	</div>
</template>

<script lang="ts" src="./edit"></script>
