import { newE2EPage } from '@stencil/core/testing';

describe('gregor-hires-project-evidence-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<gregor-hires-project-evidence-app></gregor-hires-project-evidence-app>');

    const element = await page.find('gregor-hires-project-evidence-app');
    expect(element).toHaveClass('hydrated');
  });
});
