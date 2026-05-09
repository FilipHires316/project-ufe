import { Component, Host, Prop, State, h, EventEmitter, Event } from '@stencil/core';

type EvidedPatient = {
  id?: string;
  name: string;
  rodneCislo: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  address: string;
  phone: string;
  email: string;
  insurance: 'VšZP' | 'Dôvera' | 'Union' | '';
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
};

@Component({
  tag: 'gregor-hires-project-evidence-editor',
  styleUrl: 'gregor-hires-project-evidence-editor.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceEditor {

  @Prop() entryId: string;
  @Prop() apiBase: string = 'http://localhost:5000/api';
  @Prop() ambulanceId: string = 'bobulova';

  @Event({ eventName: "editor-closed" }) editorClosed: EventEmitter<string>;

  @State() private patient: EvidedPatient = this.emptyPatient();
  @State() private isLoading: boolean = false;
  @State() private errorMessage: string = '';
  @State() private invalidFields: string[] = [];

  private fieldLabels: Record<string, string> = {
    name: 'Meno a priezvisko',
    rodneCislo: 'Rodné číslo',
    dateOfBirth: 'Dátum narodenia',
    gender: 'Pohlavie',
    insurance: 'Zdravotná poisťovňa',
  };

  private emptyPatient(): EvidedPatient {
    return {
      name: '',
      rodneCislo: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      email: '',
      insurance: '',
      bloodType: '',
      allergies: '',
      chronicConditions: '',
      medications: '',
    };
  }

  private isNew(): boolean {
    return !this.entryId || this.entryId === '@new';
  }

  async componentWillLoad() {
    if (this.isNew()) {
      this.patient = this.emptyPatient();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await fetch(
        `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.entryId}`
      );
      if (!response.ok) {
        throw new Error(`Nepodarilo sa načítať pacienta (${response.status})`);
      }
      this.patient = await response.json();
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri načítaní záznamu';
    } finally {
      this.isLoading = false;
    }
  }

  private updateField<K extends keyof EvidedPatient>(field: K, value: EvidedPatient[K]) {
    this.patient = { ...this.patient, [field]: value };
    if (this.invalidFields.includes(field as string)) {
      this.invalidFields = this.invalidFields.filter(f => f !== field);
      if (this.invalidFields.length === 0) {
        this.errorMessage = '';
      }
    }
  }

  private validateRequired(): string[] {
    const required: Array<{ key: string; value: string }> = [
      { key: 'name', value: this.patient.name },
      { key: 'rodneCislo', value: this.patient.rodneCislo },
      { key: 'dateOfBirth', value: this.patient.dateOfBirth },
      { key: 'gender', value: this.patient.gender },
      { key: 'insurance', value: this.patient.insurance },
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
      const url = this.isNew()
        ? `${this.apiBase}/evidence/${this.ambulanceId}/patients`
        : `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.entryId}`;
      const method = this.isNew() ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.patient),
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
          this.errorMessage = 'Pacient s týmto rodným číslom už existuje';
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
        `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.entryId}`,
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
        <div class="error-anchor">
          {this.errorMessage && (
            <div class="error-banner">
              <md-icon>error</md-icon>
              <span>{this.errorMessage}</span>
            </div>
          )}
        </div>

        <md-filled-text-field
          label="Meno a Priezvisko"
          value={this.patient.name}
          disabled={this.isLoading}
          error={this.isInvalid('name')}
          error-text={this.isInvalid('name') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('name', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">person</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Rodné číslo"
          value={this.patient.rodneCislo}
          disabled={this.isLoading}
          error={this.isInvalid('rodneCislo')}
          error-text={this.isInvalid('rodneCislo') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('rodneCislo', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">fingerprint</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Dátum narodenia"
          type="date"
          value={this.patient.dateOfBirth}
          disabled={this.isLoading}
          error={this.isInvalid('dateOfBirth')}
          error-text={this.isInvalid('dateOfBirth') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('dateOfBirth', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">cake</md-icon>
        </md-filled-text-field>

        <md-filled-select
          label="Pohlavie"
          value={this.patient.gender}
          disabled={this.isLoading}
          error={this.isInvalid('gender')}
          error-text={this.isInvalid('gender') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('gender', (e.target as HTMLInputElement).value as EvidedPatient['gender'])}>
          <md-icon slot="leading-icon">wc</md-icon>
          <md-select-option value="male"><div slot="headline">Muž</div></md-select-option>
          <md-select-option value="female"><div slot="headline">Žena</div></md-select-option>
          <md-select-option value="other"><div slot="headline">Iné</div></md-select-option>
        </md-filled-select>

        <md-filled-text-field
          label="Adresa trvalého bydliska"
          value={this.patient.address}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('address', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">home</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Telefónne číslo"
          type="tel"
          value={this.patient.phone}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('phone', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">phone</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Email"
          type="email"
          value={this.patient.email}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('email', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">mail</md-icon>
        </md-filled-text-field>

        <md-filled-select
          label="Zdravotná poisťovňa"
          value={this.patient.insurance}
          disabled={this.isLoading}
          error={this.isInvalid('insurance')}
          error-text={this.isInvalid('insurance') ? 'Povinné pole' : ''}
          onInput={(e: InputEvent) =>
            this.updateField('insurance', (e.target as HTMLInputElement).value as EvidedPatient['insurance'])}>
          <md-icon slot="leading-icon">health_and_safety</md-icon>
          <md-select-option value="VšZP"><div slot="headline">Všeobecná zdravotná poisťovňa</div></md-select-option>
          <md-select-option value="Dôvera"><div slot="headline">Dôvera</div></md-select-option>
          <md-select-option value="Union"><div slot="headline">Union</div></md-select-option>
        </md-filled-select>

        <md-filled-select
          label="Krvná skupina"
          value={this.patient.bloodType}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('bloodType', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">bloodtype</md-icon>
          <md-select-option value="A+"><div slot="headline">A+</div></md-select-option>
          <md-select-option value="A-"><div slot="headline">A-</div></md-select-option>
          <md-select-option value="B+"><div slot="headline">B+</div></md-select-option>
          <md-select-option value="B-"><div slot="headline">B-</div></md-select-option>
          <md-select-option value="AB+"><div slot="headline">AB+</div></md-select-option>
          <md-select-option value="AB-"><div slot="headline">AB-</div></md-select-option>
          <md-select-option value="0+"><div slot="headline">0+</div></md-select-option>
          <md-select-option value="0-"><div slot="headline">0-</div></md-select-option>
        </md-filled-select>

        <md-filled-text-field
          label="Alergie"
          type="textarea"
          rows={2}
          value={this.patient.allergies}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('allergies', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">warning</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Chronické ochorenia"
          type="textarea"
          rows={2}
          value={this.patient.chronicConditions}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('chronicConditions', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">medical_information</md-icon>
        </md-filled-text-field>

        <md-filled-text-field
          label="Užívané lieky"
          type="textarea"
          rows={2}
          value={this.patient.medications}
          disabled={this.isLoading}
          onInput={(e: InputEvent) =>
            this.updateField('medications', (e.target as HTMLInputElement).value)}>
          <md-icon slot="leading-icon">medication</md-icon>
        </md-filled-text-field>

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