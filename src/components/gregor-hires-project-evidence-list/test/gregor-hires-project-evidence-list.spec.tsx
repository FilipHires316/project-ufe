import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceList } from '../gregor-hires-project-evidence-list';

describe('gregor-hires-project-evidence-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectEvidenceList],
      html: `<gregor-hires-project-evidence-list></gregor-hires-project-evidence-list>`,
    });
    expect(page.root).toEqualHtml(`
      <gregor-hires-project-evidence-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </gregor-hires-project-evidence-list>
    `);
  });
});
