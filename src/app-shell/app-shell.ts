import {LitElement, PropertyValues, html} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';
import type {MdFilledTextField} from '@material/web/all.js';

const DESTROY_TIMEOUT_MS = 1500;

@customElement('app-shell')
@withStyles(styles)
export class AppShell extends LitElement {
	@state() content = '';
	@state() remoteContent = '';

	@query('[type=textarea]') textarea: MdFilledTextField;

	destroyTimeout: number | undefined;

	constructor() {
		super();

		fetch('/api/retrieve').then(async (response) => {
			const {content} = await response.json();
			this.remoteContent = content;
		});
	}

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
					this.destroyTimeout = setTimeout(() => {
						this.content = '';
						this.textarea.focus();
					}, DESTROY_TIMEOUT_MS);
				}}
			>
				<md-icon-button
					slot="trailing-icon"
					@click=${() => {
						this.content = '';
						this.textarea.focus();
					}}
					><md-icon>close</md-icon></md-icon-button
				>
			</md-filled-text-field>
			<md-text-button inert>${this.remoteContent}</md-text-button>
		`;
	}

	async updated(changed: PropertyValues<this>) {
		if (changed.has('content') && this.content) {
			const parts = this.content.split(' ');
			const content = parts.pop();
			try {
				await fetch('/api/save', {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({content}),
				});
				this.remoteContent = content;
			} catch {}
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
