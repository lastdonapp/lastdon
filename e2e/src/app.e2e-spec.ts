import { browser, by, element } from 'protractor';

describe('App e2e test', () => {
  it('should display welcome message', () => {
    browser.get('/');

    expect(element(by.css('app-root h1')).getText()).toEqual('Welcome to Your Angular App!');
  });
});
