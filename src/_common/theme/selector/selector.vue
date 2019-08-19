<template>
	<div>
		<div class="list-group" id="theme-selector-selection">
			<app-popper block track-trigger-width>
				<a class="list-group-item has-icon">
					<template v-if="!current">
						<app-jolticon icon="chevron-down" class="list-group-item-icon" />
						<em><translate>Please choose a theme...</translate></em>
					</template>
					<template v-else>
						<div class="list-group-item-heading">
							<app-jolticon icon="chevron-down" class="list-group-item-icon" />
							<strong>{{ current.name }}</strong>
							<small class="text-muted">by @{{ current.user.username }}</small>
						</div>
						<p class="list-group-item-text">
							{{ current.description }}
						</p>
					</template>
				</a>

				<div slot="popover" class="list-group">
					<a
						class="list-group-item"
						v-for="template of templates"
						:key="template.id"
						@click="select(template.id)"
					>
						<div class="list-group-item-heading">
							<strong>{{ template.name }}</strong>
							<small class="text-muted">by @{{ template.user.username }}</small>
						</div>
						<p class="list-group-item-text">
							{{ template.description }}
						</p>
					</a>
				</div>
			</app-popper>
		</div>
	</div>
</template>

<script lang="ts" src="./selector"></script>
