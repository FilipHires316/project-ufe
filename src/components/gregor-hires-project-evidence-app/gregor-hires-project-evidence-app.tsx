import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'gregor-hires-project-evidence-app',
  styleUrl: 'gregor-hires-project-evidence-app.css',
  shadow: true,
})
export class GregorHiresProjectEvidenceApp {
  @State() private relativePath = "";

  @Prop() basePath: string = "";
  @Prop() apiBase: string = 'http://localhost:5000/api';
  @Prop() ambulanceId: string = 'bobulova';

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || "/").pathname;

    const toRelative = (path: string) => {
      if (path.startsWith(baseUri)) {
        this.relativePath = path.slice(baseUri.length);
      } else {
        this.relativePath = "";
      }
    };

    window.navigation?.addEventListener("navigate", (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      let path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
  }

  render() {
    let element = "list";
    let entryId = "@new";
    let prescriptionId = "@new";

    // Path patterns:
    //   ""                                  -> list
    //   "entry/{id}"                        -> editor
    //   "entry/{id}/prescriptions"          -> prescription-list
    //   "entry/{id}/prescriptions/{rxId}"   -> prescription-editor
    const segments = this.relativePath.split("/").filter(s => s.length > 0);

    if (segments[0] === "entry" && segments.length >= 2) {
      entryId = segments[1];

      if (segments[2] === "prescriptions") {
        if (segments.length >= 4) {
          element = "prescription-editor";
          prescriptionId = segments[3];
        } else {
          element = "prescription-list";
        }
      } else {
        element = "editor";
      }
    }

    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    let view;
    if (element === "editor") {
      view = (
        <gregor-hires-project-evidence-editor
          entry-id={entryId}
          api-base={this.apiBase}
          ambulance-id={this.ambulanceId}
          oneditor-closed={() => navigate("./list")}>
        </gregor-hires-project-evidence-editor>
      );
    } else if (element === "prescription-list") {
      view = (
        <gregor-hires-project-prescription-list
          patient-id={entryId}
          api-base={this.apiBase}
          ambulance-id={this.ambulanceId}
          onentry-clicked={(ev: CustomEvent<string>) =>
            navigate(`./entry/${entryId}/prescriptions/${ev.detail}`)}
          onback-clicked={() => navigate("./list")}>
        </gregor-hires-project-prescription-list>
      );
    } else if (element === "prescription-editor") {
      view = (
        <gregor-hires-project-prescription-editor
          prescription-id={prescriptionId}
          patient-id={entryId}
          api-base={this.apiBase}
          ambulance-id={this.ambulanceId}
          oneditor-closed={() => navigate(`./entry/${entryId}/prescriptions`)}>
        </gregor-hires-project-prescription-editor>
      );
    } else {
      view = (
        <gregor-hires-project-evidence-list
          api-base={this.apiBase}
          ambulance-id={this.ambulanceId}
          onentry-clicked={(ev: CustomEvent<string>) =>
            navigate(`./entry/${ev.detail}`)}
          onprescriptions-clicked={(ev: CustomEvent<string>) =>
            navigate(`./entry/${ev.detail}/prescriptions`)}>
        </gregor-hires-project-evidence-list>
      );
    }

    return <Host>{view}</Host>;
  }
}