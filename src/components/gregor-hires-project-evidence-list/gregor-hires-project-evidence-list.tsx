import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

type EvidedPatient = {
  id: string;
  name: string;
  rodneCislo: string;
  dateOfBirth: string;        // ISO date string YYYY-MM-DD from API
  gender: 'male' | 'female' | 'other';
  insurance: string;
  bloodType: string;
  allergies?: string;         // free-text from API; empty/missing = no allergies
};

@Component({
  tag: 'gregor-hires-project-evidence-list',
  styleUrl: 'gregor-hires-project-evidence-list.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceList {
  @Prop() apiBase: string = 'http://localhost:5000/api';
  @Prop() ambulanceId: string = 'bobulova';

  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;
  @Event({ eventName: "prescriptions-clicked" }) prescriptionsClicked: EventEmitter<string>;

  @State() private evidedPatients: EvidedPatient[] = [];
  @State() private isLoading: boolean = false;
  @State() private errorMessage: string = '';

  private async getEvidedPatientsAsync(): Promise<EvidedPatient[]> {
    const response = await fetch(`${this.apiBase}/evidence/${this.ambulanceId}/patients`);
    if (!response.ok) {
      throw new Error(`Nepodarilo sa načítať pacientov (${response.status})`);
    }
    return await response.json();
  }

  async componentWillLoad() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.evidedPatients = await this.getEvidedPatientsAsync();
    } catch (err) {
      this.errorMessage = err.message ?? 'Chyba pri načítaní pacientov';
      this.evidedPatients = [];
    } finally {
      this.isLoading = false;
    }
  }

  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private genderIcon(gender: string): string {
    switch (gender) {
      case 'male': return 'man';
      case 'female': return 'woman';
      default: return 'person';
    }
  }

  private hasAllergies(patient: EvidedPatient): boolean {
    return !!patient.allergies && patient.allergies.trim().length > 0;
  }

  private handlePrescriptionsClick(event: MouseEvent, patientId: string) {
    event.stopPropagation();
    this.prescriptionsClicked.emit(patientId);
  }

  render() {
    return (
      <Host>
        <div class="header">
          <div class="header-text">
            <div class="title">Zoznam evidovaných pacientov</div>
            <div class="subtitle">
              {this.isLoading
                ? 'Načítavam...'
                : `${this.evidedPatients.length} pacientov`}
            </div>
          </div>
          <md-filled-button
            disabled={this.isLoading}
            onClick={() => this.entryClicked.emit('@new')}>
            <md-icon slot="icon">person_add</md-icon>
            Nový pacient
          </md-filled-button>
        </div>

        {this.errorMessage && (
          <div class="error-banner">
            <md-icon>error</md-icon>
            <span>{this.errorMessage}</span>
          </div>
        )}

        <md-list>
          {this.evidedPatients.map(patient =>
            <md-list-item onClick={() => this.entryClicked.emit(patient.id)}>
              <md-icon slot="start">{this.genderIcon(patient.gender)}</md-icon>
              <div slot="headline">{patient.name}</div>
              <div slot="supporting-text">
                {`${patient.rodneCislo} • ${this.calculateAge(patient.dateOfBirth)} rokov • ${patient.insurance}`}
              </div>
              <div slot="trailing-supporting-text" class="trailing">
                {this.hasAllergies(patient) && (
                  <md-icon class="allergy-warning" title={`Alergie: ${patient.allergies}`}>
                    warning
                  </md-icon>
                )}
                <span class="blood-type">{patient.bloodType}</span>
                <md-icon-button
                  class="prescriptions-btn"
                  title="Predpisy"
                  aria-label={`Predpisy pacienta ${patient.name}`}
                  onClick={(e: MouseEvent) => this.handlePrescriptionsClick(e, patient.id)}>
                  <md-icon>receipt_long</md-icon>
                </md-icon-button>
              </div>
            </md-list-item>
          )}
        </md-list>
      </Host>
    );
  }
}