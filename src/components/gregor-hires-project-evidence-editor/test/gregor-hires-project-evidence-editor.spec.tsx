import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceEditor } from '../gregor-hires-project-evidence-editor';

describe('gregor-hires-project-evidence-editor', () => {
  it('buttons shall be of different type', async () => {
    const page = await newSpecPage({
      components: [GregorHiresProjectEvidenceEditor],
      html: `<gregor-hires-project-evidence-editor entry-id="@new"></gregor-hires-project-evidence-editor>`,
    });
    let items: any = await page.root.shadowRoot.querySelectorAll("md-filled-button");
    expect(items.length).toEqual(1);
    items = await page.root.shadowRoot.querySelectorAll("md-outlined-button");
    expect(items.length).toEqual(1);

    items = await page.root.shadowRoot.querySelectorAll("md-filled-tonal-button");
    expect(items.length).toEqual(1);
  });
});