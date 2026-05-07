import { newE2EPage } from '@stencil/core/testing';

describe('gregor-hires-project-prescription-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gregor-hires-project-prescription-editor></gregor-hires-project-prescription-editor>');

    const element = await page.find('gregor-hires-project-prescription-editor');
    expect(element).toHaveClass('hydrated');
  });
});
