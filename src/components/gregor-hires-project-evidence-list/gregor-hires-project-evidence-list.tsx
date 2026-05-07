import { Component, Event, EventEmitter, Host, h } from '@stencil/core';

type EvidedPatient = {
  name: string;
  rodneCislo: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  insurance: string;
  bloodType: string;
  hasAllergies: boolean;
};

@Component({
  tag: 'gregor-hires-project-evidence-list',
  styleUrl: 'gregor-hires-project-evidence-list.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceList {
  @Event({ eventName: "entry-clicked" }) entryClicked: EventEmitter<string>;
  @Event({ eventName: "prescriptions-clicked" }) prescriptionsClicked: EventEmitter<string>;
  evidedPatients: EvidedPatient[];

  private async getEvidedPatientsAsync(): Promise<EvidedPatient[]> {
    return await Promise.resolve([
      {
        name: 'Jožko Púčik',
        rodneCislo: '950215/1234',
        dateOfBirth: new Date(1995, 1, 15),
        gender: 'male',
        insurance: 'VšZP',
        bloodType: 'A+',
        hasAllergies: false,
      },
      {
        name: 'Bc. August Cézar',
        rodneCislo: '780923/5678',
        dateOfBirth: new Date(1978, 8, 23),
        gender: 'male',
        insurance: 'Dôvera',
        bloodType: '0-',
        hasAllergies: true,
      },
      {
        name: 'Ing. Ferdinand Trety',
        rodneCislo: '650304/9012',
        dateOfBirth: new Date(1965, 2, 4),
        gender: 'male',
        insurance: 'Union',
        bloodType: 'AB+',
        hasAllergies: false,
      },
    ]);
  }

  async componentWillLoad() {
    this.evidedPatients = await this.getEvidedPatientsAsync();
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  private genderIcon(gender: 'male' | 'female' | 'other'): string {
    switch (gender) {
      case 'male': return 'man';
      case 'female': return 'woman';
      default: return 'person';
    }
  }

  private handlePrescriptionsClick(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.prescriptionsClicked.emit(index.toString());
  }

  render() {
    return (
      <Host>
        <div class="header">
          <div class="header-text">
            <div class="title">Zoznam evidovaných pacientov</div>
            <div class="subtitle">{this.evidedPatients?.length ?? 0} pacientov</div>
          </div>
          <md-filled-button onClick={() => this.entryClicked.emit('@new')}>
            <md-icon slot="icon">person_add</md-icon>
            Nový pacient
          </md-filled-button>
        </div>

        <md-list>
          {this.evidedPatients.map((patient, index) =>
            <md-list-item onClick={() => this.entryClicked.emit(index.toString())}>
              <md-icon slot="start">{this.genderIcon(patient.gender)}</md-icon>
              <div slot="headline">{patient.name}</div>
              <div slot="supporting-text">
                {`${patient.rodneCislo} • ${this.calculateAge(patient.dateOfBirth)} rokov • ${patient.insurance}`}
              </div>
              <div slot="trailing-supporting-text" class="trailing">
                {patient.hasAllergies && (
                  <md-icon class="allergy-warning" title="Alergie">warning</md-icon>
                )}
                <span class="blood-type">{patient.bloodType}</span>
                <md-icon-button
                  class="prescriptions-btn"
                  title="Predpisy"
                  aria-label={`Predpisy pacienta ${patient.name}`}
                  onClick={(e: MouseEvent) => this.handlePrescriptionsClick(e, index)}>
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