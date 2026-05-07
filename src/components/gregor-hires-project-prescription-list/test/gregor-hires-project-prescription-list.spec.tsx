import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectPrescriptionList } from '../gregor-hires-project-prescription-list';

describe('gregor-hires-project-prescription-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectPrescriptionList],
      html: `<gregor-hires-project-prescription-list></gregor-hires-project-prescription-list>`,
    });
    expect(page.root).toEqualHtml(`
      <gregor-hires-project-prescription-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </gregor-hires-project-prescription-list>
    `);
  });
});
