import { newSpecPage } from '@stencil/core/testing';
import { GregorHiresProjectEvidenceApp } from '../gregor-hires-project-evidence-app';

describe('gregor-hires-project-evidence-app', () => {

  it('renders editor', async () => {
    const page = await newSpecPage({
      url: `http://localhost/entry/@new`,
      components: [GregorHiresProjectEvidenceApp],
      html: `<gregor-hires-project-evidence-app base-path="/"></gregor-hires-project-evidence-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual ("gregor-hires-project-evidence-editor");

  });

  it('renders list', async () => {
    const page = await newSpecPage({
      url: `http://localhost/project-evidence/`,
      components: [GregorHiresProjectEvidenceApp],
      html: `<gregor-hires-project-evidence-app base-path="/project-evidence/"></gregor-hires-project-evidence-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("gregor-hires-project-evidence-list");
  });
});