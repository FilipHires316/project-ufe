import { newE2EPage } from '@stencil/core/testing';

describe('gregor-hires-project-evidence-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gregor-hires-project-evidence-editor></gregor-hires-project-evidence-editor>');

    const element = await page.find('gregor-hires-project-evidence-editor');
    expect(element).toHaveClass('hydrated');
  });
});
