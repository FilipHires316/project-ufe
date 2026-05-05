import { Component, Host, h } from '@stencil/core';
import '@material/web/list/list'
import '@material/web/list/list-item'
import '@material/web/icon/icon'

@Component({
  tag: 'gregor-hires-project-evidence-list',
  styleUrl: 'gregor-hires-project-evidence-list.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceList {
  evidedPatients: any[] = [];

  private async getEvidedPatientsAsync(){
    return await Promise.resolve(
      [{
          name: 'Jožko Púčik',
          patientId: '10001',
          estimatedStart: new Date(Date.now() + 65 * 60),
          estimatedDurationMinutes: 15,
          condition: 'Kontrola'
      }, {
          name: 'Bc. August Cézar',
          patientId: '10096',
          estimatedStart: new Date(Date.now() + 30 * 60),
          estimatedDurationMinutes: 20,
          condition: 'Teploty'
      }, {
          name: 'Ing. Ferdinand Trety',
          patientId: '10028',
          estimatedStart: new Date(Date.now() + 5 * 60),
          estimatedDurationMinutes: 15,
          condition: 'Bolesti hrdla'
      }]
    );
  }

  async componentWillLoad() {
    this.evidedPatients = await this.getEvidedPatientsAsync();
  }

  render() {
    return (
      <Host>
        <md-list>
          {this.evidedPatients.map(patient =>
            <md-list-item>
              <div slot="headline">{patient.name}</div>
              <div slot="supporting-text">{"Predpokladaný vstup: " + patient.estimatedStart?.toLocaleString()}</div>
                <md-icon slot="start">person</md-icon>
            </md-list-item>
          )}
        </md-list>
      </Host>
    );
  }
}
