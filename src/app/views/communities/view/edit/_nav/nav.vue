<template>
	<div>
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'communities.view.edit.tags',
					}"
					active-class="active"
					exact
				>
					<translate>Tags</translate>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'communities.view.edit.collaborators',
					}"
					active-class="active"
					exact
				>
					<translate>Collaborators</translate>
				</router-link>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" src="./nav"></script>
