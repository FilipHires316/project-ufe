import { Component, Host, Prop, h, EventEmitter, Event } from '@stencil/core';

@Component({
  tag: 'gregor-hires-project-evidence-editor',
  styleUrl: 'gregor-hires-project-evidence-editor.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceEditor {

  @Prop() entryId: string;

  @Event({eventName: "editor-closed"}) editorClosed: EventEmitter<string>;

  render() {
    return (
      <Host>
        <md-filled-text-field label="Meno a Priezvisko">
          <md-icon slot="leading-icon">person</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Rodné číslo">
          <md-icon slot="leading-icon">fingerprint</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Dátum narodenia" type="date">
          <md-icon slot="leading-icon">cake</md-icon>
        </md-filled-text-field>

        <md-filled-select label="Pohlavie">
          <md-icon slot="leading-icon">wc</md-icon>
          <md-select-option value="male">
            <div slot="headline">Muž</div>
          </md-select-option>
          <md-select-option value="female">
            <div slot="headline">Žena</div>
          </md-select-option>
          <md-select-option value="other">
            <div slot="headline">Iné</div>
          </md-select-option>
        </md-filled-select>

        <md-filled-text-field label="Adresa trvalého bydliska">
          <md-icon slot="leading-icon">home</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Telefónne číslo" type="tel">
          <md-icon slot="leading-icon">phone</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Email" type="email">
          <md-icon slot="leading-icon">mail</md-icon>
        </md-filled-text-field>

        <md-filled-select label="Zdravotná poisťovňa">
          <md-icon slot="leading-icon">health_and_safety</md-icon>
          <md-select-option value="vszp">
            <div slot="headline">Všeobecná zdravotná poisťovňa</div>
          </md-select-option>
          <md-select-option value="dovera">
            <div slot="headline">Dôvera</div>
          </md-select-option>
          <md-select-option value="union">
            <div slot="headline">Union</div>
          </md-select-option>
        </md-filled-select>

        <md-filled-select label="Krvná skupina">
          <md-icon slot="leading-icon">bloodtype</md-icon>
          <md-select-option value="A+"><div slot="headline">A+</div></md-select-option>
          <md-select-option value="A-"><div slot="headline">A-</div></md-select-option>
          <md-select-option value="B+"><div slot="headline">B+</div></md-select-option>
          <md-select-option value="B-"><div slot="headline">B-</div></md-select-option>
          <md-select-option value="AB+"><div slot="headline">AB+</div></md-select-option>
          <md-select-option value="AB-"><div slot="headline">AB-</div></md-select-option>
          <md-select-option value="O+"><div slot="headline">0+</div></md-select-option>
          <md-select-option value="O-"><div slot="headline">0-</div></md-select-option>
        </md-filled-select>

        <md-filled-text-field label="Alergie" type="textarea" rows={2}>
          <md-icon slot="leading-icon">warning</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Chronické ochorenia" type="textarea" rows={2}>
          <md-icon slot="leading-icon">medical_information</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Užívané lieky" type="textarea" rows={2}>
          <md-icon slot="leading-icon">medication</md-icon>
        </md-filled-text-field>

        <md-divider></md-divider>
        <div class="actions">
          <md-filled-tonal-button id="delete"
            onClick={() => this.editorClosed.emit("delete")}>
            <md-icon slot="icon">delete</md-icon>
            Zmazať
          </md-filled-tonal-button>
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel"
            onClick={() => this.editorClosed.emit("cancel")}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button id="confirm"
            onClick={() => this.editorClosed.emit("store")}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }
}