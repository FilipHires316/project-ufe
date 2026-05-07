import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceList } from '../gregor-hires-project-evidence-list';

describe('gregor-hires-project-evidence-list', () => {
  it('renders patient list from API', async () => {
    // Mock fetch tak, aby vrátil zoznam pacientov
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'p1', name: 'Test Pacient', rodneCislo: '950215/1234',
            dateOfBirth: '1995-02-15', gender: 'male', insurance: 'VšZP', bloodType: 'A+' }
        ]),
      } as Response)
    );

    const page = await newSpecPage({
      components: [GregorHiresProjectEvidenceList],
      html: `<gregor-hires-project-evidence-list></gregor-hires-project-evidence-list>`,
    });

    // Počkaj kým sa async fetch dokončí a komponent prerenderuje
    await page.waitForChanges();

    const items = page.root.shadowRoot.querySelectorAll('md-list-item');
    expect(items.length).toEqual(1);
  });
});