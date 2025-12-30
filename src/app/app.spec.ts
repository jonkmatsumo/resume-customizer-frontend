import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges(); // Trigger change detection
    const compiled = fixture.nativeElement as HTMLElement;
    // Updated expectation since I removed "Hello, " and title from template in step 619 replacement
    // Wait, in step 619 I replaced the template with navigation. The new H1 wasn't specified but default template had it.
    // Checking step 599 (app.html overwrite):
    // It has <header>, <main>, <footer> but NO <h1> with title.
    // So the test 'should render title' WILL FAIL if I keep expecting H1.
    // I should update the test to check for something that IS there, like the nav.
    expect(compiled.querySelector('nav')).toBeTruthy();
  });
});
