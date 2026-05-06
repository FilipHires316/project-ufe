import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceList } from '../gregor-hires-project-evidence-list';

describe('gregor-hires-project-evidence-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectEvidenceList],
      html: `<gregor-hires-project-evidence-list></gregor-hires-project-evidence-list>`,
    });
    const evidenceList = page.rootInstance as GregorHiresProjectEvidenceList;
    const expectedPatients = evidenceList?.evidedPatients?.length

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");
    expect(items.length).toEqual(expectedPatients);
  });
});
