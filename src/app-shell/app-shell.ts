import {LitElement, PropertyValues, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';
import {MdFilledTextField} from '@material/web/all.js';

@customElement('app-shell')
@withStyles(styles)
export class AppShell extends LitElement {
	@state() content = '';

	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`
			<md-filled-text-field
				type="textarea"
				rows="10"
				.value=${this.content}
				@input=${(event: Event) => {
					const target = event.target as MdFilledTextField;
					this.content = target.value;
				}}
			>
				<md-icon-button
					slot="trailing-icon"
					@click=${() => {
						this.content = '';
					}}
					><md-icon>close</md-icon></md-icon-button
				>
			</md-filled-text-field>
			<md-text-button inert>${this.content}</md-text-button>
		`;
	}

	updated(changed: PropertyValues<this>) {
		if (changed.has('content') && this.content) {
			fetch('/api/save', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({content: this.content}),
			});
		}
	}
}

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

export const app = window.app; // = new AppShell());
