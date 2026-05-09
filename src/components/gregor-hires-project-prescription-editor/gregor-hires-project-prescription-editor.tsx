import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

type PrescriptionForm = 'tbl.' | 'kapsule' | 'sirup' | 'kvapky' | 'masť' | 'krém' | 'injekcia' | 'inhalátor' | 'čapík';
type PrescriptionStatus = 'active' | 'dispensed' | 'expired';
type Coverage = 'full' | 'partial' | 'none';

type Prescription = {
  id?: string;
  medicineName: string;
  strength: string;
  form: PrescriptionForm | '';
  dosage: string;
  instructions: string;
  quantity: string;
  atcCode: string;
  prescribedDate: string;
  validUntil: string;
  prescribedBy: string;
  status: PrescriptionStatus;
  repeatMonths: number;
  coverage: Coverage | '';
};

@Component({
  tag: 'gregor-hires-project-prescription-editor',
  styleUrl: 'gregor-hires-project-prescription-editor.css',
  shadow: true,
})
export class GregorHiresProjectPrescriptionEditor {

  @Prop() prescriptionId: string;
  @Prop() patientId: string;
  @Prop() patientName: string;
  @Prop() apiBase: string = 'http://localhost:5000/api';
  @Prop() ambulanceId: string = 'bobulova';

  @Event({ eventName: "editor-closed" }) editorClosed: EventEmitter<string>;

  @State() private prescription: Prescription = this.emptyPrescription();
  @State() private morning = 1;
  @State() private noon = 0;
  @State() private evening = 1;
  @State() private night = 0;
  @State() private isLoading: boolean = false;
  @State() private errorMessage: string = '';
  @State() private invalidFields: string[] = [];

  private fieldLabels: Record<string, string> = {
    medicineName: 'Názov lieku',
    strength: 'Sila',
    form: 'Lieková forma',
    quantity: 'Množstvo',
    prescribedDate: 'Vystavený dňa',
    validUntil: 'Platný do',
    prescribedBy: 'Predpísal',
  };

  private emptyPrescription(): Prescription {
    const today = new Date().toISOString().split('T')[0];
    return {
      medicineName: '',
      strength: '',
      form: '',
      dosage: '1-0-1-0',
      instructions: '',
      quantity: '',
      atcCode: '',
      prescribedDate: today,
      validUntil: '',
      prescribedBy: '',
      status: 'active',
      repeatMonths: 1,
      coverage: '',
    };
  }

  private isNew(): boolean {
    return !this.prescriptionId || this.prescriptionId === '@new';
  }

  async componentWillLoad() {
    if (this.isNew()) {
      this.prescription = this.emptyPrescription();
      this.parseDosage(this.prescription.dosage);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await fetch(
        `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.patientId}/prescriptions/${this.prescriptionId}`
      );
      if (!response.ok) {
        throw new Error(`Nepodarilo sa načítať predpis (${response.status})`);
      }
      this.prescription = await response.json();
      this.parseDosage(this.prescription.dosage);
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri načítaní predpisu';
    } finally {
      this.isLoading = false;
    }
  }

  private parseDosage(dosage: string) {
    const parts = (dosage ?? '').split('-').map(p => parseInt(p, 10));
    this.morning = isNaN(parts[0]) ? 0 : parts[0];
    this.noon = isNaN(parts[1]) ? 0 : parts[1];
    this.evening = isNaN(parts[2]) ? 0 : parts[2];
    this.night = isNaN(parts[3]) ? 0 : parts[3];
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

  private updateField<K extends keyof Prescription>(field: K, value: Prescription[K]) {
    this.prescription = { ...this.prescription, [field]: value };
    if (this.invalidFields.includes(field as string)) {
      this.invalidFields = this.invalidFields.filter(f => f !== field);
      if (this.invalidFields.length === 0) {
        this.errorMessage = '';
      }
    }
  }

  private validateRequired(): string[] {
    const required: Array<{ key: string; value: string }> = [
      { key: 'medicineName', value: this.prescription.medicineName },
      { key: 'strength', value: this.prescription.strength },
      { key: 'form', value: this.prescription.form },
      { key: 'quantity', value: this.prescription.quantity },
      { key: 'prescribedDate', value: this.prescription.prescribedDate },
      { key: 'validUntil', value: this.prescription.validUntil },
      { key: 'prescribedBy', value: this.prescription.prescribedBy },
    ];
    return required
      .filter(f => !f.value || f.value.trim() === '')
      .map(f => f.key);
  }

  private isInvalid(field: string): boolean {
    return this.invalidFields.includes(field);
  }

  private async handleStore() {
    const missing = this.validateRequired();
    if (missing.length > 0) {
      this.invalidFields = missing;
      const labels = missing.map(f => this.fieldLabels[f] || f).join(', ');
      this.errorMessage = `Vyplňte povinné polia: ${labels}`;
      return;
    }

    this.invalidFields = [];
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const payload: Prescription = {
        ...this.prescription,
        dosage: this.dosageSummary(),
      };

      const url = this.isNew()
        ? `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.patientId}/prescriptions`
        : `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.patientId}/prescriptions/${this.prescriptionId}`;
      const method = this.isNew() ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        let body: any = null;
        try { body = JSON.parse(text); } catch {}

        if (body?.missing && Array.isArray(body.missing)) {
          this.invalidFields = body.missing;
          const labels = body.missing.map((f: string) => this.fieldLabels[f] || f).join(', ');
          this.errorMessage = `Vyplňte povinné polia: ${labels}`;
          return;
        }

        if (response.status === 409) {
          this.errorMessage = 'Predpis s týmto ID už existuje';
          return;
        }

        if (response.status === 404) {
          this.errorMessage = 'Pacient alebo predpis sa nenašiel';
          return;
        }

        if (body?.message) {
          this.errorMessage = body.message;
          return;
        }

        this.errorMessage = 'Uloženie zlyhalo, skúste to znova';
        return;
      }

      this.editorClosed.emit('store');
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri ukladaní';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleDelete() {
    if (this.isNew()) {
      this.editorClosed.emit('cancel');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await fetch(
        `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.patientId}/prescriptions/${this.prescriptionId}`,
        { method: 'DELETE' }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error('Mazanie zlyhalo, skúste to znova');
      }

      this.editorClosed.emit('delete');
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri mazaní';
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return (
      <Host>
        <div class="header">
          <md-icon-button
            disabled={this.isLoading}
            onClick={() => this.editorClosed.emit('cancel')}
            aria-label="Späť">
            <md-icon>arrow_back</md-icon>
          </md-icon-button>
          <div class="header-text">
            <div class="title">{this.isNew() ? 'Nový predpis' : 'Úprava predpisu'}</div>
            {this.patientName && <div class="subtitle">{this.patientName}</div>}
          </div>
        </div>

        <div class="error-anchor">
          {this.errorMessage && (
            <div class="error-banner">
              <md-icon>error</md-icon>
              <span>{this.errorMessage}</span>
            </div>
          )}
        </div>

        <div class="section-title">Liek</div>

        <md-filled-text-field
          label="Názov lieku"
          class="full-width"
          value={this.prescription.medicineName}
          disabled={this.isLoading}
          error={this.isInvalid('medicineName')}
          error-text={this.isInvalid('medicineName') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('medicineName', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">medication</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Sila (napr. 500 mg)"
          value={this.prescription.strength}
          disabled={this.isLoading}
          error={this.isInvalid('strength')}
          error-text={this.isInvalid('strength') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('strength', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">science</md-icon>
        </md-filled-text-field>

        <md-filled-select
          label="Lieková forma"
          value={this.prescription.form}
          disabled={this.isLoading}
          error={this.isInvalid('form')}
          error-text={this.isInvalid('form') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('form', (e.target as HTMLInputElement).value as PrescriptionForm)}>
          <md-icon slot="leading-icon">pill</md-icon>
          <md-select-option value="tbl."><div slot="headline">Tablety</div></md-select-option>
          <md-select-option value="kapsule"><div slot="headline">Kapsule</div></md-select-option>
          <md-select-option value="sirup"><div slot="headline">Sirup</div></md-select-option>
          <md-select-option value="kvapky"><div slot="headline">Kvapky</div></md-select-option>
          <md-select-option value="masť"><div slot="headline">Masť</div></md-select-option>
          <md-select-option value="krém"><div slot="headline">Krém</div></md-select-option>
          <md-select-option value="injekcia"><div slot="headline">Injekcia</div></md-select-option>
          <md-select-option value="inhalátor"><div slot="headline">Inhalátor</div></md-select-option>
          <md-select-option value="čapík"><div slot="headline">Čapík</div></md-select-option>
        </md-filled-select>

        <md-filled-text-field
          label="Množstvo (napr. 30 tbl.)"
          value={this.prescription.quantity}
          disabled={this.isLoading}
          error={this.isInvalid('quantity')}
          error-text={this.isInvalid('quantity') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('quantity', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">inventory_2</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="ATC kód"
          class="atc"
          value={this.prescription.atcCode}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('atcCode', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">tag</md-icon>
        </md-filled-text-field>

        <div class="section-title">Dávkovanie</div>

        <div class="dosage-grid full-width">
          <div class="dose-slot">
            <md-icon class="dose-icon">wb_sunny</md-icon>
            <span class="dose-label">Ráno</span>
            <div class="dose-stepper">
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('morning', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.morning}</span>
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('morning', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">restaurant</md-icon>
            <span class="dose-label">Obed</span>
            <div class="dose-stepper">
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('noon', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.noon}</span>
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('noon', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">wb_twilight</md-icon>
            <span class="dose-label">Večer</span>
            <div class="dose-stepper">
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('evening', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.evening}</span>
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('evening', 1)} aria-label="Zvýšiť">
                <md-icon>add</md-icon>
              </md-icon-button>
            </div>
          </div>

          <div class="dose-slot">
            <md-icon class="dose-icon">bedtime</md-icon>
            <span class="dose-label">Noc</span>
            <div class="dose-stepper">
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('night', -1)} aria-label="Znížiť">
                <md-icon>remove</md-icon>
              </md-icon-button>
              <span class="dose-value">{this.night}</span>
              <md-icon-button disabled={this.isLoading} onClick={() => this.adjustDose('night', 1)} aria-label="Zvýšiť">
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

        <md-filled-text-field
          label="Inštrukcie pre pacienta"
          type="textarea"
          rows={2}
          class="full-width"
          value={this.prescription.instructions}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('instructions', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">info</md-icon>
        </md-filled-text-field>

        <div class="section-title">Platnosť</div>

        <md-filled-text-field
          label="Vystavený dňa"
          type="date"
          value={this.prescription.prescribedDate}
          disabled={this.isLoading}
          error={this.isInvalid('prescribedDate')}
          error-text={this.isInvalid('prescribedDate') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('prescribedDate', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">event</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Platný do"
          type="date"
          value={this.prescription.validUntil}
          disabled={this.isLoading}
          error={this.isInvalid('validUntil')}
          error-text={this.isInvalid('validUntil') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('validUntil', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">event_busy</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Predpísal"
          class="full-width"
          value={this.prescription.prescribedBy}
          disabled={this.isLoading}
          error={this.isInvalid('prescribedBy')}
          error-text={this.isInvalid('prescribedBy') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('prescribedBy', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">person</md-icon>
        </md-filled-text-field>

        <md-filled-select
          label="Opakovanie predpisu"
          value={String(this.prescription.repeatMonths ?? 1)}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('repeatMonths', parseInt((e.target as HTMLInputElement).value, 10))}>
          <md-icon slot="leading-icon">repeat</md-icon>
          <md-select-option value="1"><div slot="headline">Jednorazovo</div></md-select-option>
          <md-select-option value="3"><div slot="headline">3 mesiace</div></md-select-option>
          <md-select-option value="6"><div slot="headline">6 mesiacov</div></md-select-option>
          <md-select-option value="12"><div slot="headline">12 mesiacov</div></md-select-option>
        </md-filled-select>

        <md-filled-select
          label="Hradenie poisťovňou"
          value={this.prescription.coverage}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('coverage', (e.target as HTMLInputElement).value as Coverage)}>
          <md-icon slot="leading-icon">payments</md-icon>
          <md-select-option value="full"><div slot="headline">Plne hradený</div></md-select-option>
          <md-select-option value="partial"><div slot="headline">Čiastočne hradený</div></md-select-option>
          <md-select-option value="none"><div slot="headline">Nehradený</div></md-select-option>
        </md-filled-select>

        <md-divider></md-divider>

        <div class="actions">
          {!this.isNew() && (
            <md-filled-tonal-button id="delete"
              disabled={this.isLoading}
              onClick={() => this.handleDelete()}>
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
          )}
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel"
            disabled={this.isLoading}
            onClick={() => this.editorClosed.emit('cancel')}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button id="confirm"
            disabled={this.isLoading}
            onClick={() => this.handleStore()}>
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }
}