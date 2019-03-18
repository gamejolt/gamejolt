<template>
	<div class="route-manage-game-design">
		<div class="row">
			<div class="col-md-9">
				<form-game-design :model="game" @submit="onSubmit" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./design" />
