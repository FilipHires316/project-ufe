import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

type PrescriptionStatus = 'active' | 'dispensed' | 'expired';

type Prescription = {
  id: string;
  medicineName: string;
  strength: string;          // "500 mg", "10 mg/ml"
  form: string;              // "tbl.", "kapsule", "sirup"
  dosage: string;            // "1-0-1 po jedle"
  quantity: string;          // "30 tbl.", "1 balenie"
  prescribedDate: Date;
  validUntil: Date;
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

  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;
  @Event({ eventName: "back-clicked" }) backClicked: EventEmitter<void>;

  prescriptions: Prescription[];

  private async getPrescriptionsAsync(): Promise<Prescription[]> {
    return await Promise.resolve([
      {
        id: 'rx-001',
        medicineName: 'Ibalgin',
        strength: '400 mg',
        form: 'tbl.',
        dosage: '1-0-1 po jedle',
        quantity: '30 tbl.',
        prescribedDate: new Date(2025, 9, 12),
        validUntil: new Date(2026, 4, 12),
        prescribedBy: 'MUDr. Anna Nováková',
        status: 'active',
      },
      {
        id: 'rx-002',
        medicineName: 'Amoxicilín Sandoz',
        strength: '500 mg',
        form: 'kapsule',
        dosage: '1-1-1 každých 8 hodín',
        quantity: '21 kapsúl',
        prescribedDate: new Date(2025, 8, 28),
        validUntil: new Date(2025, 9, 28),
        prescribedBy: 'MUDr. Anna Nováková',
        status: 'dispensed',
      },
      {
        id: 'rx-003',
        medicineName: 'Paralen',
        strength: '500 mg',
        form: 'tbl.',
        dosage: 'pri bolesti, max. 4x denne',
        quantity: '24 tbl.',
        prescribedDate: new Date(2025, 5, 3),
        validUntil: new Date(2025, 10, 3),
        prescribedBy: 'MUDr. Peter Horváth',
        status: 'expired',
      },
    ]);
  }

  async componentWillLoad() {
    this.prescriptions = await this.getPrescriptionsAsync();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('sk-SK', {
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
    }
  }

  private statusIcon(status: PrescriptionStatus): string {
    switch (status) {
      case 'active': return 'pending_actions';
      case 'dispensed': return 'check_circle';
      case 'expired': return 'schedule';
    }
  }

  render() {
    return (
      <Host>
        <div class="header">
          <md-icon-button onClick={() => this.backClicked.emit()} aria-label="Späť">
            <md-icon>arrow_back</md-icon>
          </md-icon-button>
          <div class="header-text">
            <div class="title">Predpisy</div>
            {this.patientName && <div class="subtitle">{this.patientName}</div>}
          </div>
          <md-filled-button onClick={() => this.entryClicked.emit('@new')}>
            <md-icon slot="icon">add</md-icon>
            Nový predpis
          </md-filled-button>
        </div>

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