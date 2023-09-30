import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldHomeComponent } from './old-home.component';

describe('OldHomeComponent', () => {
  let component: OldHomeComponent;
  let fixture: ComponentFixture<OldHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OldHomeComponent]
    });
    fixture = TestBed.createComponent(OldHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'tm-app'`, () => {
    const fixture = TestBed.createComponent(OldHomeComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('tm-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(OldHomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('tm-app app is running!');
  });
});
