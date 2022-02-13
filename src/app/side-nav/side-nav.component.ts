import { Component, Inject, OnInit } from '@angular/core';
import { Example, EXAMPLE, ExampleSection } from '../examples/interface';

type GroupedExamples = Partial<{
  [section in ExampleSection]: Example[];
}>;

type SectionTitles = {
  [section in ExampleSection]: { section: string; sequence: number };
};

interface SideNavExamples {
  section: string;
  examples: Example[],
}

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent implements OnInit {
  protected _sectionTitles: SectionTitles = {
    creation: { section: 'Create Observables', sequence: 0 },
    combination: { section: 'Combine Observables', sequence: 1 },
    transformation: { section: 'Transform Operators', sequence: 2 },
    filtering: { section: 'Filter Operators', sequence: 3 },
    conditional: { section: 'Conditional Operators', sequence: 4 },
    mathematical: { section: 'Math Operators', sequence: 5 },
    utility: { section: 'Utility Operators', sequence: 6 },
  };

  groupedExamples: SideNavExamples[];

  constructor(
    @Inject(EXAMPLE) protected _examples: Example[],
  ) { }

  protected groupExamples(): SideNavExamples[] {
    const grouped = this._examples.reduce(
      (p, c) => ({ ...p, [c.section]: [...(p[c.section] ?? []), c] }),
      {} as GroupedExamples
    );

    const sections = Object.keys(grouped) as ExampleSection[];
    sections.sort((a, b) => this._sectionTitles[a].sequence - this._sectionTitles[b].sequence);

    return sections.map((section) => ({ section: this._sectionTitles[section].section, examples: grouped[section] }));
  }

  ngOnInit(): void {
    this.groupedExamples = this.groupExamples();
  }

  renderExample(example: Example): void {
  }
}
