<script lang="ts" src="./date"></script>

<template>
	<div>
		{{ offsetDate | date('mediumDate') }}
		{{ offsetDate | date('shortTime') }}
	</div>
</template>
