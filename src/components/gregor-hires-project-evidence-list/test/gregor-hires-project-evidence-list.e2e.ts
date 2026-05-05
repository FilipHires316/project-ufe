import { newE2EPage } from '@stencil/core/testing';

describe('gregor-hires-project-evidence-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gregor-hires-project-evidence-list></gregor-hires-project-evidence-list>');

    const element = await page.find('gregor-hires-project-evidence-list');
    expect(element).toHaveClass('hydrated');
  });
});
