<script lang="ts" src="./domain"></script>

<template>
	<div>
		<form-site-domain :model="site" :user="app.user" :game="game" @submit="onDomainSaved" />
	</div>
</template>

