<template>
	<div class="row" v-if="isRouteBootstrapped">
		<div class="col-md-9 col-lg-8">
			<form-email-preferences :model="user" />
		</div>
	</div>
</template>

<script lang="ts" src="./email-preferences" />
