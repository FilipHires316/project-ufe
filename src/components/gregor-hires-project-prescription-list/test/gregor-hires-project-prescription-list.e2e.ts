import { newE2EPage } from '@stencil/core/testing';

describe('gregor-hires-project-prescription-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gregor-hires-project-prescription-list></gregor-hires-project-prescription-list>');

    const element = await page.find('gregor-hires-project-prescription-list');
    expect(element).toHaveClass('hydrated');
  });
});
