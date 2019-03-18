<template>
	<app-card>
		<a class="card-remove" @click="remove()" v-if="showRemove">
			<app-jolticon icon="remove" />
		</a>

		<div class="card-content">
			<app-user-address-details :address="address" />
		</div>

		<div class="card-controls">
			<app-button @click="edit()" primary solid>
				<translate>Edit</translate>
			</app-button>
		</div>
	</app-card>
</template>

<script lang="ts" src="./card" />
