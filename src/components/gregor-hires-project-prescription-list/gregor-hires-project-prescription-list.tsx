import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

type PrescriptionStatus = 'active' | 'dispensed' | 'expired';

type Prescription = {
  id: string;
  medicineName: string;
  strength: string;
  form: string;
  dosage: string;
  quantity: string;
  prescribedDate: string;     // ISO date YYYY-MM-DD from API
  validUntil: string;         // ISO date YYYY-MM-DD from API
  prescribedBy: string;
  status: PrescriptionStatus;
};

@Component({
  tag: 'gregor-hires-project-prescription-list',
  styleUrl: 'gregor-hires-project-prescription-list.css',
  shadow: true,
})
export class GregorHiresProjectPrescriptionList {
  @Prop() patientId: string;
  @Prop() patientName: string;
  @Prop() apiBase: string = 'http://localhost:5000/api';
  @Prop() ambulanceId: string = 'bobulova';

  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;
  @Event({ eventName: "back-clicked" }) backClicked: EventEmitter<void>;

  @State() private prescriptions: Prescription[] = [];
  @State() private isLoading: boolean = false;
  @State() private errorMessage: string = '';

  private async getPrescriptionsAsync(): Promise<Prescription[]> {
    const response = await fetch(
      `${this.apiBase}/evidence/${this.ambulanceId}/patients/${this.patientId}/prescriptions`
    );
    if (!response.ok) {
      throw new Error(`Nepodarilo sa načítať predpisy (${response.status})`);
    }
    return await response.json();
  }

  async componentWillLoad() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.prescriptions = await this.getPrescriptionsAsync();
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri načítaní predpisov';
      this.prescriptions = [];
    } finally {
      this.isLoading = false;
    }
  }

  private formatDate(date: string): string {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }

  private statusLabel(status: PrescriptionStatus): string {
    switch (status) {
      case 'active': return 'Aktívny';
      case 'dispensed': return 'Vydaný';
      case 'expired': return 'Expirovaný';
      default: return status;
    }
  }

  private statusIcon(status: PrescriptionStatus): string {
    switch (status) {
      case 'active': return 'pending_actions';
      case 'dispensed': return 'check_circle';
      case 'expired': return 'schedule';
      default: return 'help';
    }
  }

  render() {
    return (
      <Host>
        <div class="header">
          <md-icon-button
            disabled={this.isLoading}
            onClick={() => this.backClicked.emit()}
            aria-label="Späť">
            <md-icon>arrow_back</md-icon>
          </md-icon-button>
          <div class="header-text">
            <div class="title">Predpisy</div>
            {this.patientName && <div class="subtitle">{this.patientName}</div>}
            <div class="subtitle">
              {this.isLoading
                ? 'Načítavam...'
                : `${this.prescriptions.length} predpisov`}
            </div>
          </div>
          <md-filled-button
            disabled={this.isLoading}
            onClick={() => this.entryClicked.emit('@new')}>
            <md-icon slot="icon">add</md-icon>
            Nový predpis
          </md-filled-button>
        </div>

        {this.errorMessage && (
          <div class="error-banner">
            <md-icon>error</md-icon>
            <span>{this.errorMessage}</span>
          </div>
        )}

        <md-list>
          {this.prescriptions.map(rx =>
            <md-list-item onClick={() => this.entryClicked.emit(rx.id)}>
              <md-icon slot="start">medication</md-icon>
              <div slot="headline" class="medicine-line">
                <span class="medicine-name">{rx.medicineName}</span>
                <span class="strength">{rx.strength}</span>
                <span class="form">{rx.form}</span>
              </div>
              <div slot="supporting-text" class="rx-details">
                <span class="dosage">{rx.dosage}</span>
                <span class="separator">•</span>
                <span>{rx.quantity}</span>
                <span class="separator">•</span>
                <span class="doctor">{rx.prescribedBy}</span>
              </div>
              <div slot="trailing-supporting-text" class="trailing">
                <span class={`status status-${rx.status}`}>
                  <md-icon class="status-icon">{this.statusIcon(rx.status)}</md-icon>
                  {this.statusLabel(rx.status)}
                </span>
                <span class="valid-until">do {this.formatDate(rx.validUntil)}</span>
              </div>
            </md-list-item>
          )}
        </md-list>
      </Host>
    );
  }
}