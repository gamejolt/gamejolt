<template>
	<div>
		<form-site-domain :model="site" :user="app.user" :game="game" @submit="onDomainSaved" />
	</div>
</template>

<script lang="ts" src="./domain"></script>
