import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

// type PrescriptionForm = 'tbl.' | 'kapsule' | 'sirup' | 'kvapky' | 'masť' | 'krém' | 'injekcia' | 'inhalátor' | 'čapík';
// type PrescriptionStatus = 'active' | 'dispensed' | 'expired';

@Component({
  tag: 'gregor-hires-project-prescription-editor',
  styleUrl: 'gregor-hires-project-prescription-editor.css',
  shadow: true,
})
export class GregorHiresProjectPrescriptionEditor {

  @Prop() prescriptionId: string;
  @Prop() patientName: string;

  @Event({ eventName: "editor-closed" }) editorClosed: EventEmitter<string>;

  @State() private morning = 1;
  @State() private noon = 0;
  @State() private evening = 1;
  @State() private night = 0;

  private isNew(): boolean {
    return !this.prescriptionId || this.prescriptionId === '@new';
  }

  private dosageSummary(): string {
    return `${this.morning}-${this.noon}-${this.evening}-${this.night}`;
  }

  private dailyTotal(): number {
    return this.morning + this.noon + this.evening + this.night;
  }

  private adjustDose(slot: 'morning' | 'noon' | 'evening' | 'night', delta: number) {
    const next = Math.max(0, Math.min(4, this[slot] + delta));
    this[slot] = next;
  }

  render() {
    const todayIso = new Date().toISOString().split('T')[0];

    return (
      <Host>
        <div class="header">
          <md-icon-button onClick={() => this.editorClosed.emit('cancel')} aria-label="Späť">
            <md-icon>arrow_back</md-icon>
          </md-icon-button>
          <div class="header-text">
            <div class="title">{this.isNew() ? 'Nový predpis' : 'Úprava predpisu'}</div>
            {this.patientName && <div class="subtitle">{this.patientName}</div>}
          </div>
        </div>

        <div class="section-title">Liek</div>

        <md-filled-text-field label="Názov lieku" class="full-width">
          <md-icon slot="leading-icon">medication</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Sila (napr. 500 mg)">
          <md-icon slot="leading-icon">science</md-icon>
        </md-filled-text-field>

        <md-filled-select label="Lieková forma">
          <md-icon slot="leading-icon">pill</md-icon>
          <md-select-option value="tbl."><div slot="headline">Tablety</div></md-select-option>
          <md-select-option value="kapsule"><div slot="headline">Kapsule</div></md-select-option>
          <md-select-option value="sirup"><div slot="headline">Sirup</div></md-select-option>
          <md-select-option value="kvapky"><div slot="headline">Kvapky</div></md-select-option>
          <md-select-option value="mast"><div slot="headline">Masť</div></md-select-option>
          <md-select-option value="krem"><div slot="headline">Krém</div></md-select-option>
          <md-select-option value="injekcia"><div slot="headline">Injekcia</div></md-select-option>
          <md-select-option value="inhalator"><div slot="headline">Inhalátor</div></md-select-option>
          <md-select-option value="capik"><div slot="headline">Čapík</div></md-select-option>
        </md-filled-select>

        <md-filled-text-field label="Množstvo (napr. 30 tbl.)">
          <md-icon slot="leading-icon">inventory_2</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="ATC kód" class="atc">
          <md-icon slot="leading-icon">tag</md-icon>
        </md-filled-text-field>

        <div class="section-title">Dávkovanie</div>

        <div class="dosage-grid full-width">
          <div class="dose-slot">
            <md-icon class="dose-icon">wb_sunny</md-icon>
            <span class="dose-label">Ráno</span>
            <div class="dose-stepper">
              <md-icon-button onClick={() => this.adjustDose('morning', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.morning}</span>
              <md-icon-button onClick={() => this.adjustDose('morning', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">restaurant</md-icon>
            <span class="dose-label">Obed</span>
            <div class="dose-stepper">
              <md-icon-button onClick={() => this.adjustDose('noon', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.noon}</span>
              <md-icon-button onClick={() => this.adjustDose('noon', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">wb_twilight</md-icon>
            <span class="dose-label">Večer</span>
            <div class="dose-stepper">
              <md-icon-button onClick={() => this.adjustDose('evening', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.evening}</span>
              <md-icon-button onClick={() => this.adjustDose('evening', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">bedtime</md-icon>
            <span class="dose-label">Noc</span>
            <div class="dose-stepper">
              <md-icon-button onClick={() => this.adjustDose('night', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.night}</span>
              <md-icon-button onClick={() => this.adjustDose('night', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>
        </div>

        <div class="dosage-summary full-width">
          <span class="summary-label">Schéma:</span>
          <span class="summary-value">{this.dosageSummary()}</span>
          <span class="separator">•</span>
          <span class="summary-label">Denne:</span>
          <span class="summary-value">{this.dailyTotal()}</span>
        </div>

        <md-filled-text-field label="Inštrukcie pre pacienta" type="textarea" rows={2} class="full-width">
          <md-icon slot="leading-icon">info</md-icon>
        </md-filled-text-field>

        <div class="section-title">Platnosť</div>

        <md-filled-text-field label="Vystavený dňa" type="date" value={todayIso}>
          <md-icon slot="leading-icon">event</md-icon>
        </md-filled-text-field>

        <md-filled-text-field label="Platný do" type="date">
          <md-icon slot="leading-icon">event_busy</md-icon>
        </md-filled-text-field>

        <md-filled-select label="Opakovanie predpisu">
          <md-icon slot="leading-icon">repeat</md-icon>
          <md-select-option value="1" selected><div slot="headline">Jednorazovo</div></md-select-option>
          <md-select-option value="3"><div slot="headline">3 mesiace</div></md-select-option>
          <md-select-option value="6"><div slot="headline">6 mesiacov</div></md-select-option>
          <md-select-option value="12"><div slot="headline">12 mesiacov</div></md-select-option>
        </md-filled-select>

        <md-filled-select label="Hradenie poisťovňou">
          <md-icon slot="leading-icon">payments</md-icon>
          <md-select-option value="full"><div slot="headline">Plne hradený</div></md-select-option>
          <md-select-option value="partial"><div slot="headline">Čiastočne hradený</div></md-select-option>
          <md-select-option value="none"><div slot="headline">Nehradený</div></md-select-option>
        </md-filled-select>

        <md-divider></md-divider>

        <div class="actions">
          {!this.isNew() && (
            <md-filled-tonal-button id="delete"
              onClick={() => this.editorClosed.emit('delete')}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
          )}
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel"
            onClick={() => this.editorClosed.emit('cancel')}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button id="confirm"
            onClick={() => this.editorClosed.emit('store')}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }
}