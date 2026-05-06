import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceEditor } from '../gregor-hires-project-evidence-editor';

describe('gregor-hires-project-evidence-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectEvidenceEditor],
      html: `<gregor-hires-project-evidence-editor></gregor-hires-project-evidence-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <gregor-hires-project-evidence-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </gregor-hires-project-evidence-editor>
    `);
  });
});
