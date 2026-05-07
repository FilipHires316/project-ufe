import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectPrescriptionEditor } from '../gregor-hires-project-prescription-editor';

describe('gregor-hires-project-prescription-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectPrescriptionEditor],
      html: `<gregor-hires-project-prescription-editor></gregor-hires-project-prescription-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <gregor-hires-project-prescription-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </gregor-hires-project-prescription-editor>
    `);
  });
});
